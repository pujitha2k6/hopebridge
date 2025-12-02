import React, { useState } from 'react';
import { 
  GraduationCap, 
  Heart, 
  ShieldCheck, 
  Upload, 
  CheckCircle, 
  ChevronLeft, 
  Bell, 
  User, 
  TrendingUp,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AppScreen, UserRole, StudentProfile, DonorPreferences } from './types';
import { Button } from './components/Button';
import { Input, Select } from './components/Input';
import { verifyDocumentWithAI } from './services/geminiService';

// --- MOCK DATA ---
const MOCK_STUDENTS: StudentProfile[] = [
  {
    id: '1',
    name: 'Harika Krishna',
    course: 'B.Tech 2nd Year',
    percentage: 86,
    income: 40000,
    category: 'Single Parent',
    isVerified: true,
    documents: ['memo1.jpg'],
    description: 'Aiming to become a software engineer to support my mother. Need assistance for tuition fees.',
    marksHistory: [
      { exam: '10th', score: 92 },
      { exam: 'Inter', score: 88 },
      { exam: 'Sem 1', score: 85 },
      { exam: 'Sem 2', score: 86 },
    ]
  },
  {
    id: '2',
    name: 'Rahul Verma',
    course: 'B.Sc Computer Science',
    percentage: 78,
    income: 35000,
    category: 'Very Poor',
    isVerified: true,
    documents: ['memo2.jpg'],
    description: 'My father is a daily wage laborer. I want to complete my degree.',
    marksHistory: [
      { exam: '10th', score: 80 },
      { exam: 'Inter', score: 75 },
      { exam: 'Year 1', score: 78 },
    ]
  }
];

// --- SCREEN COMPONENTS (Moved outside App to prevent re-renders) ---

interface WelcomeScreenProps {
  onSetRole: (role: UserRole) => void;
  onNavigate: (screen: AppScreen) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSetRole, onNavigate }) => (
  <div className="flex flex-col h-full justify-between p-8 bg-gradient-to-br from-white to-purple-50">
    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
        <Heart className="w-12 h-12 text-primary" fill="currentColor" fillOpacity={0.2} />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
        Hope<span className="text-primary">Bridge</span>
      </h1>
      <p className="text-lg text-textLight leading-relaxed max-w-xs">
        No student should stop studying because of money.
      </p>
    </div>
    
    <div className="space-y-4 w-full mb-8">
      <Button 
        fullWidth 
        onClick={() => { onSetRole(UserRole.STUDENT); onNavigate(AppScreen.STUDENT_REGISTER); }}
        className="shadow-lg shadow-primary/20"
      >
        I am a Student
      </Button>
      <Button 
        fullWidth 
        variant="outline" 
        onClick={() => { onSetRole(UserRole.DONOR); onNavigate(AppScreen.DONOR_REGISTER); }}
      >
        I am a Donor
      </Button>
    </div>
    
    <div className="text-center pb-4">
      <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" /> Connecting Students & Donors with Trust
      </p>
    </div>
  </div>
);

interface StudentRegistrationProps {
  data: { name: string; phone: string; email: string; income: string };
  setData: React.Dispatch<React.SetStateAction<{ name: string; phone: string; email: string; income: string }>>;
  onNavigate: (screen: AppScreen) => void;
}

const StudentRegistrationScreen: React.FC<StudentRegistrationProps> = ({ data, setData, onNavigate }) => (
  <div className="p-6 h-full flex flex-col fade-in">
    <div className="flex items-center gap-2 mb-6">
      <button 
        onClick={() => onNavigate(AppScreen.WELCOME)}
        className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-textLight text-sm mt-0.5">Start your journey.</p>
      </div>
    </div>

    <div className="flex-1 space-y-4 overflow-y-auto pb-6">
      <Input 
        label="Full Name" 
        placeholder="e.g. Harika Krishna" 
        value={data.name}
        onChange={e => setData(prev => ({...prev, name: e.target.value}))}
      />
      <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" />
      <Input label="Email Address" type="email" placeholder="student@example.com" />
      <Input label="Class / Course" placeholder="e.g. B.Tech 2nd Year" />
      <Input label="Annual Family Income" type="number" placeholder="₹ per year" />
      <div className="grid grid-cols-2 gap-4">
          <Input label="State" placeholder="Telangana" />
          <Input label="District" placeholder="Hyderabad" />
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-gray-100">
      <Button fullWidth onClick={() => onNavigate(AppScreen.STUDENT_DASHBOARD)}>
        Create Account
      </Button>
      <p className="text-center text-sm text-textLight mt-4">
        Already registered? <span className="text-primary font-semibold cursor-pointer">Login</span>
      </p>
    </div>
  </div>
);

interface StudentDashboardProps {
  name: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  docsUploaded: boolean;
  onNavigate: (screen: AppScreen) => void;
}

const StudentDashboardScreen: React.FC<StudentDashboardProps> = ({ name, status, docsUploaded, onNavigate }) => (
  <div className="bg-gray-50 min-h-screen pb-20 fade-in">
    {/* Header */}
    <div className="bg-primary pt-12 pb-24 px-6 rounded-b-[2.5rem] shadow-soft relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <GraduationCap size={120} color="white" />
      </div>
      <div className="flex justify-between items-center text-white mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate(AppScreen.WELCOME)}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold">Hello, {name || 'Student'}</h2>
            <p className="text-white/80 text-sm">Let's verify your profile</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Bell size={20} />
        </div>
      </div>
    </div>

    <div className="px-6 -mt-16 relative z-10 space-y-6">
      {/* Status Card */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-gray-900">Verification Status</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === 'Verified' ? 'bg-green-100 text-green-700' : 
            status === 'Rejected' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {status}
          </span>
        </div>
        
        <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-textLight mb-1">
                <span>Profile Completion</span>
                <span>{docsUploaded ? '80%' : '40%'}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                  className="bg-accent h-2.5 rounded-full transition-all duration-1000" 
                  style={{ width: docsUploaded ? '80%' : '40%' }}
                ></div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant={status === 'Verified' ? "secondary" : "primary"} 
                fullWidth 
                className="text-sm py-2"
                onClick={() => onNavigate(AppScreen.UPLOAD_MARKS)}
                disabled={status === 'Verified'}
              >
                {status === 'Verified' ? 'Documents Verified' : 'Upload Marks Memo'}
              </Button>
            </div>
        </div>
      </div>

      {/* Support Status */}
      <div className="bg-white rounded-2xl p-6 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary">
            <Heart size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Donor Match</h4>
            <p className="text-xs text-textLight">We are reviewing your profile. You will be notified once matched.</p>
          </div>
      </div>
    </div>
  </div>
);

interface UploadMarksProps {
  onNavigate: (screen: AppScreen) => void;
  onVerificationComplete: () => void;
}

const UploadMarksScreen: React.FC<UploadMarksProps> = ({ onNavigate, onVerificationComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{isValid: boolean, reason: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setAiResult(null);
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    setIsLoading(true);
    
    const result = await verifyDocumentWithAI(file);
    
    setIsLoading(false);
    setAiResult(result);
    
    if (result.isValid) {
      onVerificationComplete();
      setTimeout(() => onNavigate(AppScreen.STUDENT_DASHBOARD), 2500);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col bg-white fade-in">
      <div className="flex items-center gap-3 mb-8">
          <button onClick={() => onNavigate(AppScreen.STUDENT_DASHBOARD)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold">Upload Documents</h2>
      </div>

      <div className="flex-1">
        <label className="block w-full aspect-[4/3] border-2 border-dashed border-primary/30 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer relative flex flex-col items-center justify-center overflow-hidden group">
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
          ) : (
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="text-primary" size={28} />
              </div>
              <p className="font-medium text-gray-900">Tap to upload Marks Memo</p>
              <p className="text-sm text-textLight mt-1">Supports JPG, PNG (Max 5MB)</p>
            </div>
          )}
        </label>

        <div className="mt-6 space-y-4">
            <Input label="Exam Name" placeholder="e.g. Intermediate 2nd Year" />
            <Input label="Percentage / CGPA" placeholder="e.g. 88%" />
        </div>

        {aiResult && (
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${aiResult.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {aiResult.isValid ? <CheckCircle className="shrink-0 mt-0.5" size={20} /> : <ShieldCheck className="shrink-0 mt-0.5" size={20} />}
              <div>
                  <p className="font-semibold text-sm">{aiResult.isValid ? 'Verified by AI' : 'Verification Failed'}</p>
                  <p className="text-xs mt-1 opacity-90">{aiResult.reason}</p>
              </div>
            </div>
        )}
      </div>

      <div className="mt-6">
        <Button 
          fullWidth 
          onClick={handleVerify} 
          disabled={!file} 
          isLoading={isLoading}
          className="mb-2"
        >
          {aiResult?.isValid ? 'Success!' : 'Verify using AI'}
        </Button>
        <p className="text-center text-xs text-textLight flex items-center justify-center gap-1">
            <ShieldCheck size={12} /> AI checks for fake or tampered certificates.
        </p>
      </div>
    </div>
  );
};

interface DonorRegistrationProps {
  prefs: DonorPreferences;
  setPrefs: React.Dispatch<React.SetStateAction<DonorPreferences>>;
  onNavigate: (screen: AppScreen) => void;
}

const DonorRegistrationScreen: React.FC<DonorRegistrationProps> = ({ prefs, setPrefs, onNavigate }) => (
  <div className="p-6 h-full flex flex-col bg-white fade-in">
      <div className="flex items-center gap-2 mb-6 mt-2">
      <button 
        onClick={() => onNavigate(AppScreen.WELCOME)}
        className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Donor Preferences</h2>
        <p className="text-textLight text-sm">Help us match you.</p>
      </div>
    </div>

    <div className="space-y-6 flex-1 overflow-y-auto pb-6">
      <div>
        <label className="text-sm font-medium text-textLight ml-1 block mb-2">Monthly Budget Support</label>
        <div className="grid grid-cols-3 gap-2">
            {[1000, 2000, 5000].map(amt => (
              <button 
              key={amt}
              onClick={() => setPrefs(prev => ({...prev, budget: amt}))}
              className={`py-3 rounded-xl border font-medium text-sm transition-all ${
                prefs.budget === amt 
                ? 'border-primary bg-primary/5 text-primary' 
                : 'border-gray-200 text-gray-600'
              }`}
              >
                ₹{amt.toLocaleString()}
              </button>
            ))}
        </div>
      </div>

      <Select label="Gender Preference" value={prefs.gender} onChange={(e) => setPrefs(prev => ({...prev, gender: e.target.value}))}>
        <option>Any Gender</option>
        <option>Girls Only</option>
        <option>Boys Only</option>
      </Select>

      <Select label="Family Background" value={prefs.background} onChange={(e) => setPrefs(prev => ({...prev, background: e.target.value}))}>
        <option>Any Background</option>
        <option>Single Parent</option>
        <option>Orphan</option>
        <option>Very Poor Income</option>
      </Select>

      <Select label="Study Level" value={prefs.studyLevel} onChange={(e) => setPrefs(prev => ({...prev, studyLevel: e.target.value}))}>
        <option>Any Level</option>
        <option>School</option>
        <option>Intermediate (11-12th)</option>
        <option>Degree / Engineering</option>
      </Select>

      <Input label="Preferred Location" placeholder="e.g. Hyderabad, or Leave Empty" 
          value={prefs.location}
          onChange={(e) => setPrefs(prev => ({...prev, location: e.target.value}))}
      />
    </div>

    <div className="pt-4 border-t border-gray-100">
      <Button fullWidth onClick={() => onNavigate(AppScreen.DONOR_DASHBOARD)}>
        Save Preferences & Continue
      </Button>
    </div>
  </div>
);

interface DonorDashboardProps {
  prefs: DonorPreferences;
  onNavigate: (screen: AppScreen) => void;
}

const DonorDashboardScreen: React.FC<DonorDashboardProps> = ({ prefs, onNavigate }) => (
  <div className="bg-gray-50 min-h-screen pb-20 fade-in">
      {/* Donor Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <button 
                onClick={() => onNavigate(AppScreen.WELCOME)}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
             >
                <ChevronLeft size={24} />
             </button>
             <div>
               <h2 className="text-xl font-bold text-gray-900">Welcome, Donor!</h2>
               <p className="text-textLight text-sm">Ready to make an impact?</p>
             </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User size={20} className="text-gray-600" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Match Card */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white shadow-soft relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <h3 className="text-lg font-bold mb-2 relative z-10">New Matches Found!</h3>
          <p className="text-white/80 text-sm mb-6 relative z-10 max-w-[80%]">Based on your preferences, we found 2 students who urgently need support.</p>
          <Button 
            variant="secondary" 
            onClick={() => onNavigate(AppScreen.MATCHED_STUDENTS)}
            className="font-bold relative z-10"
          >
            View Matched Students
          </Button>
        </div>

        {/* Stats / Preferences Summary */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Your Preferences</h4>
          <div className="bg-white rounded-2xl p-4 shadow-card grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-textLight">Budget</p>
                <p className="font-semibold text-primary">₹{prefs.budget || '2,000'}/mo</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-textLight">Support</p>
                <p className="font-semibold text-primary">{prefs.studyLevel === 'Any' ? 'All Levels' : prefs.studyLevel}</p>
              </div>
          </div>
        </div>
      </div>
  </div>
);

interface MatchedStudentsProps {
  onSelectStudent: (s: StudentProfile) => void;
  onNavigate: (screen: AppScreen) => void;
}

const MatchedStudentsScreen: React.FC<MatchedStudentsProps> = ({ onSelectStudent, onNavigate }) => (
  <div className="bg-gray-50 min-h-screen flex flex-col fade-in">
      <div className="bg-white p-6 shadow-sm flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => onNavigate(AppScreen.DONOR_DASHBOARD)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-bold">Matched Students</h2>
      </div>

      <div className="p-6 space-y-4 overflow-y-auto">
        {MOCK_STUDENTS.map(student => (
          <div key={student.id} className="bg-white rounded-2xl p-5 shadow-card hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{student.name}</h3>
                  <p className="text-primary font-medium text-sm">{student.course}</p>
                </div>
                {student.isVerified && (
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={10} /> VERIFIED
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-textLight" />
                  <span className="font-medium text-gray-900">{student.percentage}%</span> Score
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-textLight" />
                  <span>{student.category}</span>
                </div>
                <div className="col-span-2 text-xs text-textLight bg-gray-50 p-2 rounded-lg mt-1">
                    Family Income: ₹{student.income.toLocaleString()}/year
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 py-2 text-sm"
                  onClick={() => { onSelectStudent(student); onNavigate(AppScreen.STUDENT_DETAIL); }}
                >
                  View Profile
                </Button>
                <Button className="flex-1 py-2 text-sm shadow-none">
                  Support
                </Button>
              </div>
          </div>
        ))}
      </div>
  </div>
);

interface StudentDetailProps {
  student: StudentProfile | null;
  onNavigate: (screen: AppScreen) => void;
}

const StudentDetailProfileScreen: React.FC<StudentDetailProps> = ({ student, onNavigate }) => {
  if (!student) return null;

  return (
    <div className="bg-white min-h-screen flex flex-col fade-in">
      <div className="relative h-48 bg-primary">
        <button onClick={() => onNavigate(AppScreen.MATCHED_STUDENTS)} className="absolute top-6 left-6 p-2 bg-white/20 rounded-full text-white backdrop-blur-md z-10 transition-colors hover:bg-white/30">
            <ChevronLeft size={24} />
          </button>
          <div className="absolute -bottom-10 left-6 w-24 h-24 bg-white p-1 rounded-2xl shadow-md">
            <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
              <User size={40} className="text-gray-400" />
            </div>
          </div>
      </div>

      <div className="pt-12 px-6 pb-24">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-primary font-medium">{student.course}</p>
            </div>
            {student.isVerified && (
              <div className="flex flex-col items-end">
                <ShieldCheck className="text-green-500 mb-1" />
                <span className="text-[10px] text-green-600 font-bold tracking-wide">VERIFIED</span>
              </div>
            )}
          </div>

          <p className="mt-4 text-gray-600 text-sm leading-relaxed">
            "{student.description}"
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-textLight mb-1">Annual Income</p>
                <p className="font-bold text-gray-900">₹{student.income.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-textLight mb-1">Attendance</p>
                <p className="font-bold text-gray-900">92%</p>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-8">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Academic Performance
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={student.marksHistory}>
                  <XAxis dataKey="exam" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={32}>
                    {student.marksHistory?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === student.marksHistory!.length - 1 ? '#553CFF' : '#CBD5E1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Documents */}
          <div className="mt-8">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary" /> Verified Documents
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-gray-200">
                  <span className="text-xs text-gray-500">Marks Memo</span>
              </div>
              <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-gray-200">
                  <span className="text-xs text-gray-500">Income Cert.</span>
              </div>
            </div>
          </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] max-w-md mx-auto">
          <Button fullWidth className="shadow-lg shadow-primary/25 text-lg">
            Support {student.name.split(' ')[0]}
          </Button>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.WELCOME);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.NONE);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  
  // Registration States
  const [studentRegData, setStudentRegData] = useState({ name: '', phone: '', email: '', income: '' });
  const [donorPrefs, setDonorPrefs] = useState<DonorPreferences>({
    budget: 0, gender: 'Any', background: 'Any', studyLevel: 'Any', location: ''
  });

  // Mock student state
  const [studentStatus, setStudentStatus] = useState<'Pending' | 'Verified' | 'Rejected'>('Pending');
  const [studentDocsUploaded, setStudentDocsUploaded] = useState(false);

  const navigate = (to: AppScreen) => {
    window.scrollTo(0,0);
    setScreen(to);
  };

  const handleVerificationComplete = () => {
    setStudentStatus('Verified');
    setStudentDocsUploaded(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-md h-[100dvh] bg-white sm:h-[850px] sm:rounded-[2rem] sm:shadow-2xl sm:border-[8px] sm:border-gray-800 overflow-hidden relative">
        
        {/* Mobile Status Bar Simulation (Visual Only) */}
        <div className="h-6 w-full bg-transparent absolute top-0 z-50 pointer-events-none flex justify-between px-6 items-center text-[10px] font-bold text-gray-800 sm:text-white mix-blend-difference">
           <span>9:41</span>
           <div className="flex gap-1">
             <span className="w-3 h-3 bg-current rounded-full"></span>
             <span className="w-3 h-3 bg-current rounded-full"></span>
           </div>
        </div>

        <div className="h-full overflow-y-auto overflow-x-hidden scroll-smooth bg-white">
          {screen === AppScreen.WELCOME && (
            <WelcomeScreen onSetRole={setUserRole} onNavigate={navigate} />
          )}
          {screen === AppScreen.STUDENT_REGISTER && (
            <StudentRegistrationScreen 
              data={studentRegData} 
              setData={setStudentRegData} 
              onNavigate={navigate} 
            />
          )}
          {screen === AppScreen.STUDENT_DASHBOARD && (
            <StudentDashboardScreen 
              name={studentRegData.name} 
              status={studentStatus} 
              docsUploaded={studentDocsUploaded} 
              onNavigate={navigate} 
            />
          )}
          {screen === AppScreen.UPLOAD_MARKS && (
            <UploadMarksScreen 
              onNavigate={navigate} 
              onVerificationComplete={handleVerificationComplete}
            />
          )}
          {screen === AppScreen.DONOR_REGISTER && (
            <DonorRegistrationScreen 
              prefs={donorPrefs} 
              setPrefs={setDonorPrefs} 
              onNavigate={navigate} 
            />
          )}
          {screen === AppScreen.DONOR_DASHBOARD && (
            <DonorDashboardScreen 
              prefs={donorPrefs} 
              onNavigate={navigate} 
            />
          )}
          {screen === AppScreen.MATCHED_STUDENTS && (
            <MatchedStudentsScreen 
              onSelectStudent={setSelectedStudent} 
              onNavigate={navigate} 
            />
          )}
          {screen === AppScreen.STUDENT_DETAIL && (
            <StudentDetailProfileScreen 
              student={selectedStudent} 
              onNavigate={navigate} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;