import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
} from 'react';
import {
  getQuestions,
  addQuestion,
  deleteQuestion,
  // getSetting,
  getAllSettings,
  getAllReviewPanels,
  saveSetting,
  addExaminer,
  getExaminer,
  getAllExaminers,
  deleteExaminer,
  updateExaminer,
  addReviewPanel,
} from '../../models';

interface AppContextProps {
  questions: any[];
  settings: any;
  examiners: any[];
  handleAddQuestion: (newQuestion: any) => Promise<void>;
  handleDeleteQuestion: (id: number) => Promise<void>;
  handleSaveSetting: (newSettings: any) => Promise<void>;
  handleAddExaminer: (newExaminer: any) => Promise<void>;
  handleDeleteExaminer: (id: number) => Promise<void>;
  handleUpdateExaminer: (id: number, updatedExaminer: any) => Promise<void>;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [examiners, setExaminers] = useState<any[]>([]);
  const [reviewPanels, setReviewPanels] = useState<any[]>([]);

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

  const fetchExaminers = async () => {
    try {
      const allExaminers = await getAllExaminers();
      setExaminers(allExaminers);
    } catch (error) {
      console.error('Failed to fetch examiners', error);
    }
  };
  useEffect(() => {
    fetchExaminers();
  }, []);

  useEffect(() => {
    const fetchReviewPanels = async () => {
      try {
        const allReviewPanels = await getAllReviewPanels();
        setReviewPanels(allReviewPanels);
      } catch (error) {
        console.error('Failed to fetch review panels', error);
        setReviewPanels([]); // Set an empty array when there are no items in the database
      }
    };
    fetchReviewPanels();
  }, []);

  // const handleAddExaminer = async (newExaminers) => {
  //   // Assuming you have a function to add examiners to the backend
  //   await addExaminer(newExaminers);
  //   fetchExaminers(); // Fetch the updated list of examiners
  // };

  const handleAddExaminer = useCallback(
    async (newExaminer: any) => {
      try {
        const result = await addExaminer(newExaminer);
        if (
          result ===
          'Examiner with the same employee Id already exists. Edit or delete the existing examiner.'
        ) {
          console.error(result);
          return result;
        }
        const allExaminers = await getAllExaminers();
        setExaminers(allExaminers);
      } catch (error) {
        console.error('Failed to add examiner:', error);
      }
    },
    [setExaminers],
  );

  const handleDeleteExaminer = async (id: number) => {
    await deleteExaminer(id);
    fetchExaminers();
  };

  const handleUpdateExaminer = async (id: number, updatedExaminer: any) => {
    await updateExaminer(id, updatedExaminer);
    fetchExaminers();
  };

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

  const handleAddReviewPanel = async (newReviewPanel: any) => {
    await addReviewPanel(newReviewPanel);
    const allReviewPanels = await getAllReviewPanels();
    setReviewPanels(allReviewPanels);
  };

  const contextValue = useMemo(
    () => ({
      questions,
      settings,
      examiners,
      reviewPanels,
      handleAddQuestion,
      handleDeleteQuestion,
      handleSaveSetting,
      handleAddExaminer,
      handleDeleteExaminer,
      handleUpdateExaminer,
      handleAddReviewPanel,
    }),
    [
      questions,
      settings,
      examiners,
      reviewPanels,
      handleAddExaminer,
      handleDeleteExaminer,
      handleUpdateExaminer,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
