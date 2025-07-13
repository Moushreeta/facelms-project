import { useState, useMemo, useEffect } from 'react'; // This is the corrected import line
import { User, Users, MentorScore, DailyAttendance, PendingChange, View, Subjects, Subject } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, getDocs, where } from 'firebase/firestore';

import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import UserProfilePage from './components/UserProfilePage';
import UserManagement from './components/UserManagement';
import { ScoreEntryPage, DailyAttendancePage } from './components/DataEntry';
import { LoadingSpinner } from './components/ui';

function App() {
  const [authState, setAuthState] = useState<{ user: User | null; loading: boolean }>({ user: null, loading: true });
  const [viewAsUserId, setViewAsUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  // App-wide state for data
  const [users, setUsers] = useState<Users>({});
  const [subjects, setSubjects] = useState<Subjects>({});
  const [mentorScores, setMentorScores] = useState<MentorScore[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [view, setView] = useState<View>({ page: 'dashboard', context: {} });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid); 
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setAuthState({ user: { id: userDoc.id, ...userDoc.data() } as User, loading: false });
        } else {
          setAuthState({ user: null, loading: false });
          signOut(auth);
        }
      } else {
        setAuthState({ user: null, loading: false });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authState.user) {
      setIsDataLoading(true);
      return;
    }

    setIsDataLoading(true);
    const unsubscribers: (() => void)[] = [];
    
    const queries = {
      users: query(collection(db, 'users')),
      subjects: query(collection(db, 'subjects')),
      mentorScores: query(collection(db, 'mentorScores')),
      dailyAttendance: query(collection(db, 'dailyAttendance')),
      pendingChanges: query(collection(db, 'pendingChanges')),
    };

    unsubscribers.push(onSnapshot(queries.users, (snapshot) => {
      const data: Users = {};
      snapshot.forEach(doc => { data[doc.id] = { id: doc.id, ...doc.data() } as User; });
      setUsers(data);
    }));

    unsubscribers.push(onSnapshot(queries.subjects, (snapshot) => {
      const data: Subjects = {};
      snapshot.forEach(doc => { data[doc.id] = { id: doc.id, ...doc.data() } as Subject; });
      setSubjects(data);
    }));

    unsubscribers.push(onSnapshot(queries.mentorScores, (snapshot) => {
      const data: MentorScore[] = [];
      snapshot.forEach(doc => { data.push({ id: doc.id, ...doc.data() } as MentorScore); });
      setMentorScores(data);
    }));

    unsubscribers.push(onSnapshot(queries.dailyAttendance, (snapshot) => {
      const data: DailyAttendance[] = [];
      snapshot.forEach(doc => { data.push({ id: doc.id, ...doc.data() } as DailyAttendance); });
      setDailyAttendance(data);
    }));

    unsubscribers.push(onSnapshot(queries.pendingChanges, (snapshot) => {
      const data: PendingChange[] = [];
      snapshot.forEach(doc => { data.push({ id: doc.id, ...doc.data() } as PendingChange); });
      setPendingChanges(data);
    }));

    Promise.all(Object.values(queries).map(q => getDocs(q)))
      .then(() => setIsDataLoading(false))
      .catch(err => {
        console.error("Error fetching initial data:", err);
        setIsDataLoading(false);
      });

    return () => unsubscribers.forEach(unsub => unsub());
  }, [authState.user]);


  const handleLogin = async (employeeId: string, password: string) => {
    setError('');
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("employeeId", "==", employeeId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("No user found with the provided Employee ID.");
      }
      
      const userDoc = querySnapshot.docs[0].data();
      const email = userDoc.email;

      if (!email) {
        throw new Error("User record in database is missing an email address.");
      }

      await signInWithEmailAndPassword(auth, email, password);

    } catch (error: any) {
      console.error("Login Error:", error);
      setError('Invalid employee ID or password.');
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setViewAsUserId(null);
    setView({ page: 'dashboard', context: {} });
    setError('');
  };

  useEffect(() => {
    setView({ page: 'dashboard', context: {} });
  }, [viewAsUserId]);
  
  const loggedInUser = authState.user;
  const currentUser = useMemo(() => {
    if (viewAsUserId && users[viewAsUserId]) {
      return users[viewAsUserId];
    }
    return loggedInUser;
  }, [viewAsUserId, loggedInUser, users]);

  const renderContent = () => {
    if (!currentUser) return null;
    switch (view.page) {
        case 'userProfile':
            return <UserProfilePage userId={view.context.userId!} allUsers={users} subjects={subjects} setView={setView} mentorScores={mentorScores} dailyAttendance={dailyAttendance} />;
        case 'userManagement':
            return <UserManagement allUsers={users} loggedInUser={loggedInUser!} />;
        case 'scoreEntry':
            return <ScoreEntryPage allUsers={users} subjects={subjects} />;
        case 'attendanceEntry':
            return <DailyAttendancePage allUsers={users} dailyAttendance={dailyAttendance} currentUser={currentUser} />;
        case 'dashboard':
        default:
            return <Dashboard currentUser={currentUser} allUsers={users} subjects={subjects} setView={setView} mentorScores={mentorScores} dailyAttendance={dailyAttendance} pendingChanges={pendingChanges} />;
    }
  }

  if (authState.loading) {
    return <div className="w-screen h-screen flex justify-center items-center"><LoadingSpinner /></div>;
  }

  if (!loggedInUser || !currentUser) {
    return <LoginPage {...{ handleLogin, error }} />;
  }
  
  if (isDataLoading) {
     return <div className="w-screen h-screen flex justify-center items-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        loggedInUser={loggedInUser} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        setView={setView} 
        currentView={view.page} 
        allUsers={users} 
        setViewAsUserId={setViewAsUserId} 
        pendingChanges={pendingChanges}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;