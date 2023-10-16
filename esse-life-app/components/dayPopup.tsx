import React, { FC, useState } from 'react';
import { isSameDay } from 'date-fns';
import { parseISO, add, set } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import axios from 'axios';
import moment from 'moment'; // Import moment
import api from "@/service/api";
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

interface NewReservation {
    consultant: string;
    customerName: string;
    reservationTime: string;
    reservationDate: string;
}

const DayPopupComponent: FC<DayPopupProps> = ({ isOpen, onClose, selectedDay, reservations }) => {
    const [isFormOpen,setFormOpen]=useState(false);
    const reservationsForSelectedDay = selectedDay
        ? reservations.filter((reservation) => {
            const reservationDate = new Date(reservation.reservationDate);
            return isSameDay(selectedDay, reservationDate);
        })
        : [];


        const parsedDate = moment(selectedDay).add(1, 'days');
        const selectedDayFormatted = moment(selectedDay).format('YYYY-MM-DD');

    const [newReservation, setNewReservation] = useState<NewReservation>({
        consultant: '',
        customerName: '',
        reservationTime: '',
        reservationDate: selectedDayFormatted,
    });

    const handleReservationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/reservations', newReservation);

            if (response.status === 201) {
                console.log('Rezervasyon başarıyla eklendi.');
                window.location.reload();
            } else {
                console.error('Rezervasyon eklenemedi.');
                console.error('Sunucudan dönen hata:', response.data);
            }
        } catch (error) {
            console.error('Bir hata oluştu:', error);
        }
    };

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
                <button onClick={() => setFormOpen(true)}>Add Reservation</button>

                {isFormOpen && (
                    <div> <h2>Yeni Rezervasyon Ekle</h2>
                        <form onSubmit={handleReservationSubmit}>
                            <div>
                                <label>Danışman:</label>
                                <select
                                    name="consultant"
                                    value={newReservation.consultant}
                                    onChange={(e) => setNewReservation({ ...newReservation, consultant: e.target.value })}
                                >
                                    <option value="">Danışman Seçin</option>
                                    <option value="CONSULTANT_A">Danışman A</option>
                                    <option value="CONSULTANT_B">Danışman B</option>
                                    <option value="CONSULTANT_C">Danışman C</option>
                                </select>
                            </div>
                            <div>
                                <label>Müşteri Adı:</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={newReservation.customerName}
                                    onChange={(e) => setNewReservation({ ...newReservation, customerName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Rezervasyon Saati:</label>
                                <input
                                    type="text"
                                    name="reservationTime"
                                    value={newReservation.reservationTime}
                                    onChange={(e) => setNewReservation({ ...newReservation, reservationTime: e.target.value })}
                                />
                            </div>
                            <button type="submit">Rezervasyon Ekle</button>
                        </form></div>
                )}
            </div>
        </div>
    );
};

export default DayPopupComponent;