import { add, getHours, getMinutes, isEqual, parse, isBefore } from 'date-fns';

export const OPENING_HOURS_INTERVAL = 30;

export const now = new Date();

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const weekdayIndexToName = (index: number) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[index];
};

export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export function roundToNearestMinutes(date: Date, interval: number) {
    const roundedMinutes = Math.round(getMinutes(date) / interval) * interval;
    const roundedDate = new Date(date);
    roundedDate.setMinutes(roundedMinutes);
    return roundedDate;
}

export const getOpeningTimes = (startDate: Date, openingTime: string, closingTime: string) => {
    const dayOfWeek = startDate.getDay();
    const isToday = isEqual(startDate, new Date().setHours(0, 0, 0, 0));

    let hours: number;
    let minutes: number;

    if (isToday) {
        const currentTime = now;

        const opening = parse(openingTime, 'kk:mm', startDate);
        const closing = parse(closingTime, 'kk:mm', startDate);

        if (isBefore(currentTime, opening)) {
            hours = getHours(opening);
            minutes = getMinutes(opening);
        } else if (isBefore(currentTime, closing)) {
            hours = getHours(currentTime);
            minutes = getMinutes(currentTime);
        } else {
            throw new Error('No more bookings today');
        }
    } else {
        hours = getHours(parse(openingTime, 'kk:mm', startDate));
        minutes = getMinutes(parse(openingTime, 'kk:mm', startDate));
    }

    const beginning = add(startDate, { hours, minutes });
    const end = add(startDate, { hours: getHours(parse(closingTime, 'kk:mm', startDate)), minutes: getMinutes(parse(closingTime, 'kk:mm', startDate)) });
    const interval = OPENING_HOURS_INTERVAL;

    const times = [];
    for (let i = beginning; i <= end; i = add(i, { minutes: interval })) {
        times.push(i);
    }

    return times;
};