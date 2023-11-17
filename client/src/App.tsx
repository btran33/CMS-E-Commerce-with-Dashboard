
import './App.css'
import { 
  BrowserRouter,
  Routes,
  Route,
  useNavigate 
} from 'react-router-dom'
import { 
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  RedirectToSignIn,
  useAuth
} from '@clerk/clerk-react'

if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY)
  throw new Error("Missing Publishable Key")
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY

interface WelcomeProps {
  userId: string
}

function Welcome({userId}:WelcomeProps) {
  return (
    <div>
      Hello {userId}, you are signed in!
    </div>
  )
}

function PublicPage() {
  return (
    <>
      <h1>Public page</h1>
      <a href="/protected">Go to protected page</a>
    </>
  );
}
 
function ProtectedPage() {
  const { isLoaded, userId } = useAuth()

  if (!isLoaded || !userId) {
    return null
  }

  return (
    <>
      <h1><strong>Protected page</strong></h1>
      <Welcome userId={userId}/>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();
 
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      navigate={(to) => navigate(to)}
    >
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route
          path="/sign-in/*"
          element={<SignIn routing="path" path="/sign-in" />}
        />
        <Route
          path="/sign-up/*"
          element={<SignUp routing="path" path="/sign-up" />}
        />
        <Route
          path="/protected"
          element={
          <>
            <SignedIn>
              <ProtectedPage />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
          }
        />
      </Routes>
    </ClerkProvider>
  );
}
 
function App() {
  return (
    <BrowserRouter>
      <ClerkProviderWithRoutes />
    </BrowserRouter>
  );
}

export default App
