import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const services = [
  {
    title: "Digital Marketing",
    slug: "digital-marketing",
    icon: "megaphone",
    shortDesc:
      "Facebook & Instagram ads, social media management and lead generation built around your business goals.",
    description:
      "We plan and run marketing campaigns that reach the right audience and turn attention into enquiries. From campaign planning and audience targeting to retargeting and ongoing optimization, our team keeps your marketing focused on your business objective.",
    features: [
      "Facebook & Instagram Ads",
      "Social Media Management",
      "Campaign Planning",
      "Lead Generation",
      "Audience Targeting & Retargeting",
      "Marketing Strategy & Optimization",
    ],
    metaTitle: "Digital Marketing Services | Amader Agency",
    metaDescription:
      "Facebook & Instagram ads, social media management, campaign planning and lead generation from Amader Agency.",
  },
  {
    title: "Creative Design",
    slug: "creative-design",
    icon: "palette",
    shortDesc:
      "Brand identity, social media creatives, banners, posters and advertising designs that make your brand memorable.",
    description:
      "Creative thinking makes brands memorable. We design brand identities, social media creatives, promotional materials and business profiles that communicate clearly and look professional across every channel.",
    features: [
      "Brand Identity & Logo Design",
      "Social Media Creative Design",
      "Banner & Poster Design",
      "Product & Promotional Design",
      "Business Profile Design",
      "Advertising Creative",
    ],
    metaTitle: "Creative Design Services | Amader Agency",
    metaDescription:
      "Brand identity, logo, social media creative, banner and poster design from Amader Agency.",
  },
  {
    title: "Video Production",
    slug: "video-production",
    icon: "video",
    shortDesc:
      "Promotional videos, product and brand videos, reels and motion graphics, from script to final edit.",
    description:
      "From script writing and storytelling to shooting and professional editing, we produce videos that tell your brand story and support your campaigns, including reels, shorts and motion graphics for social media.",
    features: [
      "Promotional Video Production",
      "Professional Video Editing",
      "Product & Brand Videos",
      "Script Writing & Storytelling",
      "Video Shooting",
      "Reels, Shorts & Motion Graphics",
    ],
    metaTitle: "Video Production Services | Amader Agency",
    metaDescription:
      "Promotional videos, product videos, reels and motion graphics from Amader Agency.",
  },
  {
    title: "Web Development & SEO",
    slug: "web-development-seo",
    icon: "code",
    shortDesc:
      "Business and e-commerce websites, custom web applications, maintenance and SEO to help customers find you.",
    description:
      "We build fast, responsive business and e-commerce websites and custom web applications, then keep them healthy with maintenance, SEO, optimization and analytics & tracking setup.",
    features: [
      "Business & E-commerce Websites",
      "Custom Web Applications",
      "Website Maintenance",
      "Website SEO",
      "Website Optimization",
      "Analytics & Tracking Setup",
    ],
    metaTitle: "Web Development & SEO | Amader Agency",
    metaDescription:
      "Business websites, e-commerce, custom web apps and SEO from Amader Agency.",
  },
];

async function main() {
  if (process.env.DB_LABEL === "production" && process.env.ALLOW_PROD_SEED !== "1") {
    console.error("Refusing to seed a production database. Set ALLOW_PROD_SEED=1 to override.");
    process.exit(1);
  }

  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@amaderagency.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error("Set SEED_ADMIN_PASSWORD (min 8 characters) in .env before seeding.");
  }

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: process.env.SEED_ADMIN_NAME ?? "Admin",
      password: await bcrypt.hash(password, 12),
    },
  });

  for (const [index, service] of services.entries()) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: { ...service, order: index },
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      whatsapp: "+8801616491014",
      socials: { website: "https://www.amaderagency.com" },
    },
  });

  console.log(`Seed complete. Admin: ${email}, services: ${services.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
