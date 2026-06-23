import { AuthProvider, useAuth } from './auth/AuthContext';
import Style from './styles';
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

export default function App() {
  return (
    <AuthProvider>
      <Style />
      <Shell />
    </AuthProvider>
  );
}
