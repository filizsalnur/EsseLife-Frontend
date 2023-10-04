import CalendarComponent from "@/components/calendar";
import Button from '@mui/material/Button';

export default function Home() {
    return (
        <main>
            <div>
                <CalendarComponent closedDays={[]} />
            </div>
        </main>
    )
}
