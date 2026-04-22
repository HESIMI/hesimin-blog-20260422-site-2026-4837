import { PersonalInfoCard } from "@/components/home/personal-info-card";
import { ProfileShowcaseCard } from "@/components/home/profile-showcase-card";

const profileInfo = {
  id: "花生米",
  mbti: "ESFJ",
  zodiac: "天蝎座",
  signature: "把普通日子，过成闪闪发光的小冒险。",
};

const pageCopy = {
  title: "你好呀，这里是我的小宇宙 ✨",
  subtitle: "欢迎来到我的个人网站，关于我、关于你眼中的我、也关于一些偷偷想说的话。",
};

export function HomeHero() {
  return (
    <section className="grid items-stretch gap-6 pt-4 md:grid-cols-2 md:gap-8 md:pt-8">
      <ProfileShowcaseCard photoSrc="/life-photo.png" photoAlt="花生米的生活照" />
      <PersonalInfoCard
        info={profileInfo}
        title={pageCopy.title}
        subtitle={pageCopy.subtitle}
        nextHref="/tags"
      />
    </section>
  );
}

