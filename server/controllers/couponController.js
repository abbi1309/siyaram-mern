// ============================================
// COUPON CONTROLLER
// Admin manage kare, user apply kare
// ============================================

const Coupon = require('../models/Coupon');

// ============================================
// APPLY COUPON (User)
// POST /api/coupons/apply
// ============================================
const applyCoupon = async (req, res) => {
    try {
        const { code, amount, nights, roomType } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code daalein',
            });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Galat coupon code',
            });
        }

        // ─── AUTO-EXPIRE CHECKS ───
        const now = new Date();

        if (!coupon.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Ye offer abhi active nahi hai',
            });
        }

        if (now > coupon.validUntil) {
            return res.status(400).json({
                success: false,
                message: '⏰ Ye offer expire ho gaya hai',
            });
        }

        if (now < coupon.validFrom) {
            return res.status(400).json({
                success: false,
                message: 'Ye offer abhi start nahi hua',
            });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({
                success: false,
                message: 'Is offer ki limit khatam ho gayi',
            });
        }

        // ─── CONDITION CHECKS ───
        if (coupon.minAmount && amount < coupon.minAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum ₹${coupon.minAmount} ki booking chahiye`,
            });
        }

        if (coupon.minNights && nights < coupon.minNights) {
            return res.status(400).json({
                success: false,
                message: `Minimum ${coupon.minNights} nights chahiye`,
            });
        }

        if (
            coupon.applicableRoomTypes?.length > 0 &&
            roomType &&
            !coupon.applicableRoomTypes.includes(roomType)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Ye offer is room type pe valid nahi hai',
            });
        }

        // ─── PER-USER LIMIT ───
        if (req.user && coupon.perUserLimit) {
            const userUsage = coupon.usedBy.filter(
                (u) => u.userId?.toString() === req.user._id.toString()
            ).length;
            if (userUsage >= coupon.perUserLimit) {
                return res.status(400).json({
                    success: false,
                    message: 'Aap ye offer already use kar chuke hain',
                });
            }
        }

        // ─── DISCOUNT CALCULATE ───
        let discountAmount = 0;

        if (coupon.discountType === 'percent') {
            discountAmount = Math.round((amount * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else {
            discountAmount = coupon.discountValue;
        }

        if (discountAmount > amount) {
            discountAmount = amount;
        }

        const finalAmount = amount - discountAmount;

        res.json({
            success: true,
            message: `🎉 ${coupon.title} applied! ₹${discountAmount} bachaye`,
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                title: coupon.title,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            },
            discountAmount,
            originalAmount: amount,
            finalAmount,
        });
    } catch (error) {
        console.error('applyCoupon error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// GET ACTIVE COUPONS (Public — Offers page)
// GET /api/coupons
// ⚠️ Sirf active + non-expired coupons
// ============================================
const getActiveCoupons = async (req, res) => {
    try {
        const now = new Date();

        const coupons = await Coupon.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
            $or: [
                { usageLimit: null },
                { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
            ],
        })
            .select(
                'code title description badge badgeColor highlightText discountType discountValue validUntil minAmount minNights isFeatured displayOrder'
            )
            .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 });

        res.json({ success: true, coupons, count: coupons.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// CREATE COUPON (Admin)
// POST /api/coupons
// ============================================
const createCoupon = async (req, res) => {
    try {
        const {
            code,
            title,
            description,
            discountType,
            discountValue,
            badge,
            badgeColor,
            highlightText,
            minAmount,
            maxDiscount,
            minNights,
            applicableRoomTypes,
            validFrom,
            validUntil,
            usageLimit,
            perUserLimit,
            isActive,
            isFeatured,
            displayOrder,
        } = req.body;

        // Validation
        if (!code || !title || !discountType || !discountValue || !validUntil) {
            return res.status(400).json({
                success: false,
                message: 'Code, title, discount type, value aur validUntil required',
            });
        }

        if (new Date(validUntil) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Valid until future date honi chahiye',
            });
        }

        const exists = await Coupon.findOne({ code: code.toUpperCase() });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'Ye code already exist karta hai',
            });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            title,
            description: description || '',
            discountType,
            discountValue,
            badge: badge || '',
            badgeColor: badgeColor || 'gold',
            highlightText: highlightText || '',
            minAmount: minAmount || 0,
            maxDiscount: maxDiscount || null,
            minNights: minNights || 0,
            applicableRoomTypes: applicableRoomTypes || [],
            validFrom: validFrom ? new Date(validFrom) : new Date(),
            validUntil: new Date(validUntil),
            usageLimit: usageLimit || null,
            perUserLimit: perUserLimit || 1,
            isActive: isActive !== undefined ? isActive : true,
            isFeatured: isFeatured || false,
            displayOrder: displayOrder || 0,
        });

        res.status(201).json({
            success: true,
            message: 'Offer created successfully',
            coupon,
        });
    } catch (error) {
        console.error('createCoupon error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// GET ALL COUPONS (Admin — with expired)
// GET /api/coupons/all
// ============================================
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });

        // Add computed status
        const now = new Date();
        const enriched = coupons.map((c) => {
            const obj = c.toObject();
            let status = 'active';

            if (!c.isActive) status = 'inactive';
            else if (now < c.validFrom) status = 'upcoming';
            else if (now > c.validUntil) status = 'expired';
            else if (c.usageLimit && c.usedCount >= c.usageLimit)
                status = 'used_up';

            obj.status = status;
            obj.isExpired = now > c.validUntil;
            return obj;
        });

        res.json({ success: true, coupons: enriched });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// UPDATE COUPON (Admin)
// PUT /api/coupons/:id
// ============================================
const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found',
            });
        }

        // Update only provided fields
        const allowedFields = [
            'title',
            'description',
            'discountType',
            'discountValue',
            'badge',
            'badgeColor',
            'highlightText',
            'minAmount',
            'maxDiscount',
            'minNights',
            'applicableRoomTypes',
            'validFrom',
            'validUntil',
            'usageLimit',
            'perUserLimit',
            'isActive',
            'isFeatured',
            'displayOrder',
        ];

        allowedFields.forEach((f) => {
            if (req.body[f] !== undefined) {
                if (f === 'validUntil' || f === 'validFrom') {
                    coupon[f] = new Date(req.body[f]);
                } else {
                    coupon[f] = req.body[f];
                }
            }
        });

        await coupon.save();

        res.json({
            success: true,
            message: 'Coupon updated',
            coupon,
        });
    } catch (error) {
        console.error('updateCoupon error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// TOGGLE ACTIVE (Admin — quick on/off)
// PATCH /api/coupons/:id/toggle
// ============================================
const toggleCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found',
            });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json({
            success: true,
            message: coupon.isActive
                ? '✅ Offer activated'
                : '⏸️ Offer deactivated',
            isActive: coupon.isActive,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// DELETE COUPON (Admin)
// DELETE /api/coupons/:id
// ============================================
const deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// INCREMENT USAGE (Internal — booking ke baad)
// ============================================
const incrementUsage = async (couponCode, userId) => {
    try {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
        if (!coupon) return;

        coupon.usedCount += 1;
        coupon.usedBy.push({
            userId,
            usedAt: new Date(),
        });
        await coupon.save();
    } catch (error) {
        console.error('incrementUsage error:', error);
    }
};


// ============================================
// GET APPLICABLE COUPONS (Booking page ke liye)
// Sirf wahi coupons jo is booking pe lag sakte
// ============================================
const getApplicableCoupons = async (req, res) => {
    try {
        const { amount, nights, roomType } = req.body;
        const now = new Date();

        // Saare active coupons
        const coupons = await Coupon.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
            $or: [
                { usageLimit: null },
                { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
            ],
        }).sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 });

        // Har coupon check karo
        const enriched = coupons.map((c) => {
            const obj = c.toObject();

            obj.applicable = true;
            obj.reason = '';

            // Min amount
            if (c.minAmount && amount < c.minAmount) {
                obj.applicable = false;
                obj.reason = `Min ₹${c.minAmount} ki booking chahiye`;
            }

            // Min nights
            if (c.minNights && nights < c.minNights) {
                obj.applicable = false;
                obj.reason = `Min ${c.minNights} nights chahiye`;
            }

            // Room type
            if (
                c.applicableRoomTypes?.length > 0 &&
                roomType &&
                !c.applicableRoomTypes.includes(roomType)
            ) {
                obj.applicable = false;
                obj.reason = 'Is room type pe valid nahi';
            }

            // Per user limit
            if (req.user && c.perUserLimit) {
                const userUsed = c.usedBy.filter(
                    (u) => u.userId?.toString() === req.user._id.toString()
                ).length;
                if (userUsed >= c.perUserLimit) {
                    obj.applicable = false;
                    obj.reason = 'Aap already use kar chuke hain';
                }
            }

            // Discount preview
            let discountPreview = 0;
            if (obj.applicable) {
                if (c.discountType === 'percent') {
                    discountPreview = Math.round(
                        (amount * c.discountValue) / 100
                    );
                    if (c.maxDiscount && discountPreview > c.maxDiscount) {
                        discountPreview = c.maxDiscount;
                    }
                } else {
                    discountPreview = c.discountValue;
                }
                if (discountPreview > amount) discountPreview = amount;
            }
            obj.discountPreview = discountPreview;

            return obj;
        });

        res.json({ success: true, coupons: enriched });
    } catch (error) {
        console.error('getApplicableCoupons error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    applyCoupon,
    getActiveCoupons,
    createCoupon,
    getAllCoupons,
    getApplicableCoupons,
    updateCoupon,
    toggleCoupon,
    deleteCoupon,
    incrementUsage,
};