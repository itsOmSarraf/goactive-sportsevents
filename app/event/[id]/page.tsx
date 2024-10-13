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
    const eventId = params.id as string; // Assuming the id in the URL is a UUID
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
        const channel = supabaseClient.channel('custom-all-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                    filter: `event_id=eq.${eventId}`
                },
                (payload) => {
                    setComments((prevComments) => [...prevComments, payload.new]);
                }
            )
            .subscribe();

        // Clean up the subscription when the component unmounts
        return () => {
            supabaseClient.removeChannel(channel);
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

        try {
            const { data, error } = await supabase
                .from('comments')
                .insert([
                    { event_id: eventId, content: commentInput, author: randomName }
                ]);

            if (error) throw error;

            setCommentInput('');
            // No need to manually add the comment to the state, as it will be added via the real-time subscription
        } catch (error) {
            console.error('Error submitting comment:', error.message);
            // You could also set an error state and display it to the user
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
                    {/* Event details content */}
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