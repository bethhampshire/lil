/**
 * intro-call controller
 *
 * Website visitors can only create requests. Every new request is stored
 * with a "scheduled" status for the therapist to follow up. Staff (via the
 * /requests dashboard) can only change the status and the booked date.
 */

import { factories } from '@strapi/strapi';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled'];

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export default factories.createCoreController('api::intro-call.intro-call', () => ({
  async create(ctx) {
    const input = ctx.request.body?.data ?? {};

    const name = text(input.Name, 120);
    const email = text(input.Email, 254);
    const phone = text(input.Phone, 40);
    const message = text(input.Message, 2000);
    const earliestTime = text(input.EarliestTime, 5);
    const latestTime = text(input.LatestTime, 5);
    const days = Array.isArray(input.Days)
      ? WEEKDAYS.filter((day) => input.Days.includes(day))
      : [];

    const errors: string[] = [];
    if (!name) errors.push('Name is required');
    if (!EMAIL.test(email)) errors.push('A valid email is required');
    if (days.length === 0) errors.push('Choose at least one day');
    if (!TIME.test(earliestTime) || !TIME.test(latestTime)) errors.push('Times must be HH:mm');
    else if (earliestTime >= latestTime) errors.push('Latest time must be after earliest time');

    if (errors.length) {
      return ctx.badRequest(errors.join('. '), { errors });
    }

    ctx.request.body = {
      data: {
        Name: name,
        Email: email,
        Phone: phone || null,
        Days: days.join(', '),
        EarliestTime: earliestTime,
        LatestTime: latestTime,
        Message: message || null,
        CallStatus: 'scheduled',
      },
    };

    const response = await super.create(ctx);

    // Don't echo personal details back to a public caller.
    return { data: { documentId: response.data.documentId, CallStatus: 'scheduled' } };
  },

  async update(ctx) {
    const input = ctx.request.body?.data ?? {};
    const data: Record<string, unknown> = {};

    if ('CallStatus' in input) {
      if (!STATUSES.includes(input.CallStatus)) return ctx.badRequest('Unknown status');
      data.CallStatus = input.CallStatus;
    }

    if ('DateBooked' in input) {
      const date = input.DateBooked;
      if (date === null || date === '') {
        data.DateBooked = null;
      } else if (typeof date === 'string' && DATE.test(date) && !Number.isNaN(Date.parse(date))) {
        data.DateBooked = date;
      } else {
        return ctx.badRequest('Date booked must be a date (YYYY-MM-DD)');
      }
    }

    if (Object.keys(data).length === 0) return ctx.badRequest('Nothing to update');

    ctx.request.body = { data };
    return super.update(ctx);
  },
}));
