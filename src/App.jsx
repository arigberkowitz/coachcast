import { BrandProvider, useBrand } from './auth/BrandContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Style from './styles';
import ChooseSide from './components/ChooseSide';
import Auth from './components/Auth';
import WebNav from './components/WebNav';
import Phone from './components/Phone';
import PhoneApp from './components/PhoneApp';

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
  const { brand } = useBrand();
  if (!brand) return <ChooseSide />;

  const a = brand.accent;
  const themeVars = {
    '--cc-accent': a.accent,
    '--cc-accent-text': a.accentText,
    '--cc-accent-soft': a.accentSoft,
    '--cc-accent-soft2': a.accentSoft2,
    '--cc-accent-glow': a.accentGlow,
    height: '100%',
  };

  return (
    <div style={themeVars}>
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
