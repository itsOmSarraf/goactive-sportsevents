'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, UsersIcon, DollarSignIcon } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EventPage() {
    const params = useParams();
    const eventId = params.id;
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [supabase, setSupabase] = useState(null);

    useEffect(() => {
        const supabaseClient = createClient();
        setSupabase(supabaseClient);

        const fetchEventDetails = async () => {
            const { data, error } = await supabaseClient
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single();

            if (error) {
                console.error('Error fetching event details:', error);
            } else {
                setEvent(data);
            }
            setLoading(false);
        };

        const fetchComments = async () => {
            const { data, error } = await supabaseClient
                .from('comments')
                .select('*')
                .eq('event_id', eventId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching comments:', error);
            } else {
                setComments(data);
            }
        };

        fetchEventDetails();
        fetchComments();

        // Set up real-time subscription
        const commentsSubscription = supabaseClient
            .channel('comments')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `event_id=eq.${eventId}` }, (payload) => {
                setComments((prevComments) => [...prevComments, payload.new]);
            })
            .subscribe();

        return () => {
            commentsSubscription.unsubscribe();
        };
    }, [eventId]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleCommentInputChange = (e) => {
        setCommentInput(e.target.value);
    };

    const handleCommentSubmit = async () => {
        if (!commentInput.trim()) return;

        const randomName = `Anonymous${Math.floor(Math.random() * 1000)}`;

        const { data, error } = await supabase
            .from('comments')
            .insert([
                { event_id: eventId, content: commentInput, author: randomName }
            ]);

        if (error) {
            console.error('Error submitting comment:', error);
        } else {
            setCommentInput('');
        }
    };

    if (loading) {
        return <div>Loading event details...</div>;
    }

    if (!event) {
        return <div>Event not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="w-full max-w-2xl mx-auto mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-5 w-5 text-gray-500" />
                            <span>
                                {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MapPinIcon className="h-5 w-5 text-gray-500" />
                            <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <UsersIcon className="h-5 w-5 text-gray-500" />
                            <span>{event.max_participants} participants max</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <DollarSignIcon className="h-5 w-5 text-gray-500" />
                            <Badge variant={event.is_paid ? "default" : "secondary"}>
                                {event.is_paid ? `$${event.price}` : "Free"}
                            </Badge>
                        </div>
                        {event.additional_info && (
                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">Additional Information:</h3>
                                <p>{event.additional_info}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Live Commentary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 mb-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-100 p-3 rounded">
                                <p className="font-semibold text-blue-500">{comment.author}</p>
                                <p className="text-gray-700">{comment.content}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                        <Input
                            value={commentInput}
                            onChange={handleCommentInputChange}
                            placeholder="Type your comment..."
                        />
                        <Button onClick={handleCommentSubmit}>Send</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-4 w-full max-w-2xl mx-auto">
                <Input value={inputValue} onChange={handleInputChange} />
                <Button className="mt-2">{inputValue == event.price ? "Paid" : "Pay"}</Button>
            </div>
        </div>
    );
}