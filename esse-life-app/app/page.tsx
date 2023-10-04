import CalendarComponent from "@/components/calendar";


export default function Home() {
    return (
        <main>
            <div>
                <CalendarComponent closedDays={[]} />
            </div>
        </main>
    )
}
