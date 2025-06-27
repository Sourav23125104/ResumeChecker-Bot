'use client'
import Head from 'next/head'
import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  return (
    <>
      <Head>
        <title>Resume Tailor ChatBot</title>
      </Head>
      <main style={{ minHeight: '100vh', background: '#fafafa', padding: '2rem' }}>
        <ChatInterface/>
      </main>
    </>
  );
}
