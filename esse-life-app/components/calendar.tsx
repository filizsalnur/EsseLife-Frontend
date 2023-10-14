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
import DayPopupComponent from "@/components/dayPopup";


const DynamicCalendar = dynamic(() => import('react-calendar'), { ssr: false })

interface CalendarProps {

    closedDays: string[]
}

const CalendarComponent: FC<CalendarProps> = ({ closedDays }) => {
    const openingTime = '08:00';
    const closingTime = '21:00';

    const nowDate = new Date();
    const roundedNow = roundToNearestMinutes(nowDate, OPENING_HOURS_INTERVAL);
    const closing = parse(closingTime, 'kk:mm', nowDate);
    const tooLate = !isBefore(roundedNow, closing);
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    if (tooLate) closedDays.push(formatISO(new Date().setHours(0, 0, 0, 0)));

    const [date, setDate] = useState<DateTime>({
        justDate: null,
        dateTime: null,
    });
    interface Reservation {
        id: number;
        customerName: string;
        consultant: string;
        reservationCompleted: boolean;
        reservationDate: string;
        reservationTime: string;
    }
    const getColorByConsultant = (consultant: string) => {
        if (consultant === 'CONSULTANT_A') {
            return 'yellow';
        } else if (consultant === 'CONSULTANT_B') {
            return 'pink';
        } else if (consultant === 'CONSULTANT_C') {
            return 'cyan';
        } else {
            return 'transparent';
        }
    };
    const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);

    const filterReservationsByConsultant = (reservations: Reservation[], consultant: string) => {
        return reservations.filter((reservation) => reservation.consultant === consultant);
    };
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await api.get("/reservations");
                setReservations(response.data);
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
                return isSameDay(date, reservationDate) && (!selectedConsultant || reservation.consultant === selectedConsultant);
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
            <select onChange={(e) => setSelectedConsultant(e.target.value)}>
                <option value="">Tüm Danışmanlar</option>
                <option value="CONSULTANT_A">Danışman A</option>
                <option value="CONSULTANT_B">Danışman B</option>
                <option value="CONSULTANT_C">Danışman C</option>
            </select>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <DynamicCalendar
                    minDate={nowDate}
                    className='REACT-CALENDAR p-2'
                    view='month'
                    tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
                    onClickDay={(date) => {
                        setDate((prev) => ({ ...prev, justDate: date }));
                        setSelectedDay(date);
                        setPopupOpen(true);
                    }}
                    tileContent={({ date, view }) =>
                        view === 'month' ? (
                            <div className='custom-tile-content'>
                                {getCustomTileContent(date)}
                            </div>
                        ) : null
                    }
                />
                {isPopupOpen && (
                    <DayPopupComponent
                        isOpen={isPopupOpen}
                        onClose={() => setPopupOpen(false)}
                        selectedDay={selectedDay}
                        reservations={
                            selectedConsultant
                                ? filterReservationsByConsultant(reservations, selectedConsultant)
                                : reservations
                        }

                    />
                )}
            </div>
        </Box>
    );
};

export default CalendarComponent;