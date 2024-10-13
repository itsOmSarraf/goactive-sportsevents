'use client'
import { Button } from '@/components/ui/button'
import React from 'react'
import { useRouter } from 'next/navigation'

interface ButtonClickingProps {
    id: string | number;
}

export default function ButtonClicking({ id }: ButtonClickingProps) {
    const router = useRouter()
    return (
        <div>
            <Button
                onClick={() => {
                    router.push(`/event/${id}`)
                }}>
                Join Event
            </Button>
        </div>
    )
}
