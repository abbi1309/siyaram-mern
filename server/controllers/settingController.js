// ============================================
// SETTING CONTROLLER
// Hotel settings get/update
// ============================================

const Setting = require('../models/Setting');
const Room = require('../models/Room');

// Default footer (agar purane document me field missing ho)
const DEFAULT_FOOTER = {
    description: 'Experience divine hospitality near Ram Mandir. Modern amenities with traditional values.',
    copyright: '© 2026 Siyaram Palace. All Rights Reserved.',
};

// Default contact 👈 NAYA
const DEFAULT_CONTACT = {
    addressLine1:   'Near Ram Mandir',
    addressLine2:   'Ayodhya, Uttar Pradesh - 224123',
    phone1:         '+91 9315377668',
    phone2:         '+91 8400675764',
    email1:         'info@siyarampace.in',
    email2:         'booking@siyarampace.in',
    receptionHours: 'Open 24/7',
    checkInOut:     'Check-in: 12 PM | Check-out: 11 AM',
};

// ============================================
// GET SETTINGS
// Public — koi bhi access kar sakta
// ============================================
const getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne({ key: 'main' });

        if (!settings) {
            settings = await Setting.create({ key: 'main' });
        }

        let changed = false;

        // Auto-migrate footer (agar missing ho)
        if (!settings.footer || !settings.footer.description) {
            settings.footer = DEFAULT_FOOTER;
            changed = true;
        }

        // Auto-migrate contact 👈 NAYA
        if (!settings.contact || !settings.contact.addressLine1) {
            settings.contact = DEFAULT_CONTACT;
            changed = true;
        }

        if (changed) await settings.save();

        // Total rooms dynamically count karo
        const totalRooms = await Room.countDocuments({ isActive: true });

        const response = settings.toObject();
        response.totalRooms = totalRooms;

        res.json({ success: true, settings: response });
    } catch (error) {
        console.error('getSettings error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// UPDATE SETTINGS (Admin only)
// ============================================
const updateSettings = async (req, res) => {
    try {
        const {
            hotelName,
            location,
            phone,
            email,
            priceRange,
            facebook,
            instagram,
            whatsapp,
            whyChooseUs,
            footer,
            contact,              // 👈 YE ADD KIYA
        } = req.body;

        let settings = await Setting.findOne({ key: 'main' });
        if (!settings) {
            settings = new Setting({ key: 'main' });
        }

        // ============ Simple fields ============
        if (hotelName  !== undefined) settings.hotelName  = hotelName;
        if (location   !== undefined) settings.location   = location;
        if (phone      !== undefined) settings.phone      = phone;
        if (email      !== undefined) settings.email      = email;
        if (priceRange !== undefined) settings.priceRange = priceRange;
        if (facebook   !== undefined) settings.facebook   = facebook;
        if (instagram  !== undefined) settings.instagram  = instagram;
        if (whatsapp   !== undefined) settings.whatsapp   = whatsapp;

        // ============ Why Choose Us (nested) ============
        if (whyChooseUs !== undefined) {
            settings.whyChooseUs = {
                badge:    whyChooseUs.badge    ?? settings.whyChooseUs?.badge    ?? 'WHY CHOOSE US',
                title:    whyChooseUs.title    ?? settings.whyChooseUs?.title    ?? '',
                subtitle: whyChooseUs.subtitle ?? settings.whyChooseUs?.subtitle ?? '',
                features: Array.isArray(whyChooseUs.features)
                    ? whyChooseUs.features
                    : settings.whyChooseUs?.features ?? [],
            };
        }

        // ============ Footer (nested) ============
        if (footer !== undefined) {
            settings.footer = {
                description: footer.description ?? settings.footer?.description ?? DEFAULT_FOOTER.description,
                copyright:   footer.copyright   ?? settings.footer?.copyright   ?? DEFAULT_FOOTER.copyright,
            };
        }

        // ============ Contact (nested) 👈 YE BLOCK ADD KIYA ============
        if (contact !== undefined) {
            settings.contact = {
                addressLine1:   contact.addressLine1   ?? settings.contact?.addressLine1   ?? DEFAULT_CONTACT.addressLine1,
                addressLine2:   contact.addressLine2   ?? settings.contact?.addressLine2   ?? DEFAULT_CONTACT.addressLine2,
                phone1:         contact.phone1         ?? settings.contact?.phone1         ?? DEFAULT_CONTACT.phone1,
                phone2:         contact.phone2         ?? settings.contact?.phone2         ?? DEFAULT_CONTACT.phone2,
                email1:         contact.email1         ?? settings.contact?.email1         ?? DEFAULT_CONTACT.email1,
                email2:         contact.email2         ?? settings.contact?.email2         ?? DEFAULT_CONTACT.email2,
                receptionHours: contact.receptionHours ?? settings.contact?.receptionHours ?? DEFAULT_CONTACT.receptionHours,
                checkInOut:     contact.checkInOut     ?? settings.contact?.checkInOut     ?? DEFAULT_CONTACT.checkInOut,
            };
        }

        await settings.save();

        res.json({
            success: true,
            message: 'Settings updated ✅',
            settings,
        });
    } catch (error) {
        console.error('updateSettings error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings,
};