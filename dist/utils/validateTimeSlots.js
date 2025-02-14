"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTimeSlots = validateTimeSlots;
// Validation function
function validateTimeSlots(timeSlots) {
    const now = new Date();
    return timeSlots.every(slot => {
        const slotDate = new Date(slot.date);
        return slotDate > now && (slotDate.getTime() - now.getTime()) >= 24 * 60 * 60 * 1000;
    });
}
