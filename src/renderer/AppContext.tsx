import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import {
  getQuestions,
  addQuestion,
  deleteQuestion,
  // getSetting,
  getAllSettings,
  saveSetting,
} from '../models';

interface AppContextProps {
  questions: any[];
  settings: any;
  handleAddQuestion: (newQuestion: any) => Promise<void>;
  handleDeleteQuestion: (id: number) => Promise<void>;
  handleSaveSetting: (newSettings: any) => Promise<void>;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const allQuestions = await getQuestions();
      setQuestions(allQuestions);
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const appSettings = await getAllSettings();
        setSettings(appSettings);
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();
  }, []);

  const handleAddQuestion = async (newQuestion: any) => {
    await addQuestion(newQuestion);
    const allQuestions = await getQuestions();
    setQuestions(allQuestions);
  };

  const handleDeleteQuestion = async (id: number) => {
    await deleteQuestion(id);
    const allQuestions = await getQuestions();
    setQuestions(allQuestions);
  };

  const handleSaveSetting = async (newSettings: any) => {
    // console.log({
    //   stationName: { code: 'VOBL', name: 'KIA Bengaluru', city: 'bengaluru' },
    //   unitsApplicable: ['ADC', 'ACC'],
    // });
    await saveSetting(newSettings);
    const appSettings = await getAllSettings();
    setSettings(appSettings);
  };

  const contextValue = useMemo(
    () => ({
      questions,
      settings,
      handleAddQuestion,
      handleDeleteQuestion,
      handleSaveSetting,
    }),
    [questions, settings],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
