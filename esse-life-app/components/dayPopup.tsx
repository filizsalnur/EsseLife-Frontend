import React, { FC, useState } from 'react';
import { isSameDay } from 'date-fns';
import { parseISO, add, set } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import axios from 'axios';
import moment from 'moment'; // Import moment
import api from "@/service/api";
import Button from '@mui/material/Button';
import {
    Dialog,
    DialogContent,
    FormControl,
    IconButton,
    Input,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from "@mui/material";
import {CloseIcon} from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
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
        <Dialog open={isOpen} onClose={onClose} maxWidth="xs">
            <DialogContent>
                <div className="popup-container">
                    <div className="popup">
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={onClose}
                            style={{ position: 'absolute', top: 0, right: 0 }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" component="div">
                            {selectedDay ? (
                                `Tıklanan günün tarihi: ${selectedDay.toDateString()}`
                            ) : (
                                'Bir gün seçilmedi.'
                            )}
                        </Typography>
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
                        <Button onClick={() => setFormOpen(!isFormOpen)} variant="contained" color="primary">
                            Add Reservation
                        </Button>
                        {isFormOpen && (
                            <div>

                                <h2>Yeni Rezervasyon Ekle</h2>
                                <form onSubmit={handleReservationSubmit}>
                                    <FormControl fullWidth>
                                        <InputLabel>Danışman:</InputLabel>
                                        <Select
                                            name="consultant"
                                            value={newReservation.consultant}
                                            onChange={(e) => setNewReservation({ ...newReservation, consultant: e.target.value })}
                                        >
                                            <MenuItem value="">Danışman Seçin</MenuItem>
                                            <MenuItem value="CONSULTANT_A">Danışman A</MenuItem>
                                            <MenuItem value="CONSULTANT_B">Danışman B</MenuItem>
                                            <MenuItem value="CONSULTANT_C">Danışman C</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Müşteri Adı:</InputLabel>
                                        <Input
                                            type="text"
                                            name="customerName"
                                            value={newReservation.customerName}
                                            onChange={(e) => setNewReservation({ ...newReservation, customerName: e.target.value })}
                                        />
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Rezervasyon Saati:</InputLabel>
                                        <Input
                                            type="text"
                                            name="reservationTime"
                                            value={newReservation.reservationTime}
                                            onChange={(e) => setNewReservation({ ...newReservation, reservationTime: e.target.value })}
                                        />
                                    </FormControl>
                                    <Button type="submit" variant="contained" color="primary">Rezervasyon Ekle</Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DayPopupComponent;