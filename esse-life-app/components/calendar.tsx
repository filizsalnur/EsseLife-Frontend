'use client'
import {format, formatISO, isBefore, isSameDay, parse} from 'date-fns'
import dynamic from 'next/dynamic'
import { FC, useEffect, useState } from 'react'
import { now, OPENING_HOURS_INTERVAL } from '@/constants/config'
import { getOpeningTimes, roundToNearestMinutes } from '@/utils/helper'
import { DateTime } from '@/utils/types'
import './calendar.css'
import {Box} from "@mui/system";
import axios from "axios";
import api from '@/service/api';


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
    interface Reservation {
        id: number;
        customerName: string;
        consultant: string;
        reservationCompleted: boolean;
        reservationDate: string;
        reservationTime: string;
    }

    const [reservations, setReservations] = useState<Reservation[]>([]);
    if (tooLate) closedDays.push(formatISO(new Date().setHours(0, 0, 0, 0)));

    const [date, setDate] = useState<DateTime>({
        justDate: null,
        dateTime: null,
    });
    const getColorByConsultant = (consultant: string) => {
        if (consultant === 'CONSULTANT_A') {
            return 'yellow';
        } else if (consultant === 'CONSULTANT_B') {
            return 'pink';
        }else if (consultant === 'CONSULTANT_C') {
            return 'cyan';
        }
        else {
            return 'transparent';
        }
    };
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await api.get("/reservations"); // api modülünü kullanarak isteği yapın
                setReservations(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        };
        fetchCustomers();
    }, []);

    const getCustomTileContent = (date: Date) => {
        const matchingReservations = reservations
            .filter((reservation) => {
                const reservationDate = new Date(reservation.reservationDate);
                return isSameDay(date, reservationDate);
            })
            .sort((a, b) => {
                return a.reservationTime.localeCompare(b.reservationTime);
            });

        if (matchingReservations.length > 0) {
            return (
                <div>
                    {matchingReservations.map((reservation) => (
                        <div
                            key={reservation.id}
                            style={{ backgroundColor: getColorByConsultant(reservation.consultant) }}
                        >
                            {reservation.reservationTime.substring(0, 5)}  - {reservation.customerName}
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    useEffect(() => {
        if (date.dateTime) {
            localStorage.setItem('selectedTime', date.dateTime.toISOString());
            console.log(date.dateTime.toISOString());
        }
    }, [date.dateTime]);

    const times = date.justDate && getOpeningTimes(date.justDate, openingTime, closingTime);

    return (
        <Box>
            <div  style={{display: "flex",
                justifyContent: "center",}}>
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
                        tileContent={({ date, view }) =>
                            view === 'month' ? (
                                <div className='custom-tile-content'>
                                    {getCustomTileContent(date)}
                                </div>
                            ) : null
                        }
                    />
                )}
        </div>
        </Box>

    );
};

export default CalendarComponent;