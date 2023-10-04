import React, { FC } from 'react';
import { isSameDay } from 'date-fns';

interface DayPopupProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDay: Date | null;
    reservations: Reservation[];
}

interface Reservation {
    id: number;
    customerName: string;
    consultant: string;
    reservationCompleted: boolean;
    reservationDate: string;
    reservationTime: string;
}

const DayPopupComponent: FC<DayPopupProps> = ({ isOpen, onClose, selectedDay, reservations }) => {
    const reservationsForSelectedDay = selectedDay
        ? reservations.filter((reservation) => {
            const reservationDate = new Date(reservation.reservationDate);
            return isSameDay(selectedDay, reservationDate);
        })
        : [];

    return (
        <div className={`popup-container ${isOpen ? 'open' : ''}`}>
            <div className={`popup ${isOpen ? 'open' : ''}`}>
                {selectedDay ? (
                    <>
                        <p>Tıklanan günün tarihi: {selectedDay.toDateString()}</p>
                        <h2>Rezervasyonlar:</h2>
                        {reservationsForSelectedDay.length > 0 ? (
                            <ul>
                                {reservationsForSelectedDay.map((reservation) => (
                                    <li key={reservation.id}>
                                        Saat: {reservation.reservationTime}, Müşteri: {reservation.customerName}, Danışman: {reservation.consultant}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Bu tarih için randevu bulunmamaktadır.</p>
                        )}
                    </>
                ) : (
                    <p>Bir gün seçilmedi.</p>
                )}
                <button onClick={onClose}>Kapat</button>
            </div>
        </div>
    );
};

export default DayPopupComponent;