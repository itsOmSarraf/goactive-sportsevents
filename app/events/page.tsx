import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import ButtonClicking from "./ButtonClicking";
// import NotificationComponent from "@/components/Notifications";
export default async function EventsPage() {
    const supabase = createClient();
    const { data: events } = await supabase.from('events').select();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Upcoming Events</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* <NotificationComponent /> */}
                {events?.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                        <CardHeader>
                            <CardTitle>{event.title}</CardTitle>
                            <CardDescription>{event.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                                <CalendarIcon className="h-4 w-4" />
                                <time dateTime={event.start_date}>
                                    {new Date(event.start_date).toLocaleDateString()}
                                </time>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                                <MapPinIcon className="h-4 w-4" />
                                <span>{event.location}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                                <UsersIcon className="h-4 w-4" />
                                <span>{event.max_participants} participants</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <Badge variant={event.is_paid ? "default" : "secondary"}>
                                    {event.is_paid ? `$${event.price}` : "Free"}
                                </Badge>
                                <ButtonClicking id={event.id} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}