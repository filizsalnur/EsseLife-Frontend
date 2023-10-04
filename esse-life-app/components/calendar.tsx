'use client'
import {format, formatISO, isBefore, parse} from 'date-fns'
import dynamic from 'next/dynamic'

import { FC, useEffect, useState } from 'react'
import { now, OPENING_HOURS_INTERVAL } from '@/constants/config'
import { getOpeningTimes, roundToNearestMinutes } from '@/utils/helper'
import { DateTime } from '@/utils/types'
import './calendar.css'
import {Box} from "@mui/system";
const DynamicCalendar = dynamic(() => import('react-calendar'), { ssr: false })

interface CalendarProps {

    closedDays: string[]
}

const CalendarComponent: FC<CalendarProps> = ({ closedDays }) => {

    const openingTime = '08:00';
    const closingTime = '18:00';


    const nowDate = new Date();
    const roundedNow = roundToNearestMinutes(nowDate, OPENING_HOURS_INTERVAL);
    const closing = parse(closingTime, 'kk:mm', nowDate);
    const tooLate = !isBefore(roundedNow, closing);
    if (tooLate) closedDays.push(formatISO(new Date().setHours(0, 0, 0, 0)));

    const [date, setDate] = useState<DateTime>({
        justDate: null,
        dateTime: null,
    });

    useEffect(() => {
        if (date.dateTime) {
            localStorage.setItem('selectedTime', date.dateTime.toISOString());
            console.log(date.dateTime.toISOString());
        }
    }, [date.dateTime]);

    const times = date.justDate && getOpeningTimes(date.justDate, openingTime, closingTime);

    return (
        <Box>
            <div className='flex h-screen flex-col items-center justify-center'>
            {date.justDate ? (
                <div className='flex max-w-lg flex-wrap gap-4'>
                    {times?.map((time, i) => (
                        <div className='rounded-sm bg-gray-100 p-2' key={`time-${i}`}>
                            <button onClick={() => setDate((prev) => ({ ...prev, dateTime: time }))} type='button'>
                                {format(time, 'kk:mm')}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <DynamicCalendar
                    minDate={nowDate}
                    className='REACT-CALENDAR p-2'
                    view='month'
                    tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
                    onClickDay={(date) => setDate((prev) => ({ ...prev, justDate: date }))}
                />
            )}
        </div>
        </Box>

    );
};

export default CalendarComponent;