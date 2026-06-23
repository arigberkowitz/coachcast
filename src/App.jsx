import { useEffect } from 'react';
import { BrandProvider, useBrand } from './auth/BrandContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { FAMILY } from './lib/brands';
import Style from './styles';
import ChooseSide from './components/ChooseSide';
import Auth from './components/Auth';
import WebNav from './components/WebNav';
import Phone from './components/Phone';
import PhoneApp from './components/PhoneApp';
import FamilyPortal from './components/FamilyPortal';

const themeStyle = (a) => ({
  '--cc-accent': a.accent,
  '--cc-accent-text': a.accentText,
  '--cc-accent-soft': a.accentSoft,
  '--cc-accent-soft2': a.accentSoft2,
  '--cc-accent-glow': a.accentGlow,
  height: '100%',
});

function Shell() {
  const { user } = useAuth();
  if (!user) return <Auth />;

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <WebNav />
      <Phone>
        <PhoneApp />
      </Phone>
    </div>
  );
}

function ThemedApp() {
  const { brand, brandId } = useBrand();

  useEffect(() => {
    document.title = brandId === 'family'
      ? "Family progress — CoachCast"
      : brand
        ? `${brand.name} — recaps parents actually read`
        : 'CoachCast · TutorCast';
  }, [brand, brandId]);

  if (!brandId) return <ChooseSide />;

  if (brandId === 'family') {
    return (
      <div style={themeStyle(FAMILY.accent)}>
        <FamilyPortal />
      </div>
    );
  }

  if (!brand) return <ChooseSide />;

  return (
    <div style={themeStyle(brand.accent)}>
      <AuthProvider brand={brand}>
        <Shell />
      </AuthProvider>
    </div>
  );
}

export default function App() {
  return (
    <BrandProvider>
      <Style />
      <ThemedApp />
    </BrandProvider>
  );
}
