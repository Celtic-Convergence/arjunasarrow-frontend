import React from 'react'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import { AnnouncementBanner } from '@/components/home/announcement-banner'

const DynamicHomeHero = dynamic(() => import('../components/home/hero'))
const DynamicHomeFeature = dynamic(() => import('../components/home/feature'))
const DynamicHomePopularCourse = dynamic(() => import('../components/home/popular-courses'))
const DynamicHomeSuccessStories = dynamic(() => import('../components/home/alumni'))
const DynamicHomeContact = dynamic(() => import('../components/home/contact'))

const Home: NextPageWithLayout = () => {
  return (
    <>
      <AnnouncementBanner />
      <DynamicHomeHero />
      <DynamicHomePopularCourse />
      <DynamicHomeFeature />
      <DynamicHomeSuccessStories />
      <DynamicHomeContact />
    </>
  )
}

Home.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default Home
