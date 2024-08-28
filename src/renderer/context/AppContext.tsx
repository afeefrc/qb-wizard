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
  addPendingChange,
  getPendingChanges,
  updatePendingChange,
  deletePendingChange,
  applyPendingChange,
  applyAllPendingChanges,
  // getSetting,
  getAllSettings,
  getAllReviewPanels,
  saveSetting,
  addExaminer,
  // getExaminer,
  getAllExaminers,
  deleteExaminer,
  updateExaminer,
  addReviewPanel,
  deleteReviewPanel,
  updateReviewPanel,
  addExaminerAssignment,
  deleteExaminerAssignment,
  updateExaminerAssignment,
  getAllExaminerAssignments,
  addSyllabusSection,
  // getSyllabusSection,
  getAllSyllabusSections,
  deleteSyllabusSection,
  updateSyllabusSection,
} from '../../models';

interface AppContextProps {
  questions: any[];
  settings: any;
  examiners: any[];
  handleDeleteQuestion: (deleteId: number, updatedChange: any) => Promise<void>;
  handleAddPendingChange: (change: any) => Promise<void>;
  handleGetPendingChanges: () => Promise<void>;
  handleUpdatePendingChange: (id: number, updatedChange: any) => Promise<void>;
  handleDeletePendingChange: (id: number) => Promise<void>;
  handleUpdateQuestion: (id: number, updatedQuestion: any) => Promise<void>;
  handleApplyPendingChange: (id: number) => Promise<void>;
  handleApplyAllPendingChanges: () => Promise<void>;
  handleSaveSetting: (newSettings: any) => Promise<void>;
  handleAddExaminer: (newExaminer: any) => Promise<void>;
  handleDeleteExaminer: (id: number) => Promise<void>;
  handleUpdateExaminer: (id: number, updatedExaminer: any) => Promise<void>;
  handleAddReviewPanel: (newReviewPanel: any) => Promise<void>;
  handleDeleteReviewPanel: (id: number) => Promise<void>;
  handleUpdateReviewPanel: (
    id: number,
    updatedReviewPanel: any,
  ) => Promise<void>;
  handleAddExaminerAssignment: (newExaminerAssignment: any) => Promise<void>;
  handleAddSyllabusSection: (newSyllabusSection: any) => Promise<void>;
  handleUpdateSyllabusSection: (
    id: number,
    updatedSyllabusSection: any,
  ) => Promise<void>;
  syllabusSections: any[];
  handleDeleteSyllabusSection: (id: number) => Promise<void>;
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
  const [examinerAssignments, setExaminerAssignments] = useState<any[]>([]);
  const [syllabusSections, setSyllabusSections] = useState<any[]>([]);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);

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

  const fetchExaminers = useCallback(async () => {
    try {
      const allExaminers = await getAllExaminers();
      setExaminers(allExaminers);
    } catch (error) {
      console.error('Failed to fetch examiners', error);
    }
  }, []);

  useEffect(() => {
    fetchExaminers();
  }, [fetchExaminers]);

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

  useEffect(() => {
    const fetchExaminerAssignments = async () => {
      try {
        const allExaminerAssignments = await getAllExaminerAssignments();
        setExaminerAssignments(allExaminerAssignments);
      } catch (error) {
        console.error('Failed to fetch examiner assignments', error);
        setExaminerAssignments([]); // Set an empty array when there are no items in the database
      }
    };
    fetchExaminerAssignments();
  }, []);

  useEffect(() => {
    const fetchSyllabusSections = async () => {
      const allSyllabusSections = await getAllSyllabusSections();
      setSyllabusSections(allSyllabusSections);
    };
    fetchSyllabusSections();
  }, []);

  useEffect(() => {
    const fetchPendingChanges = async () => {
      const allPendingChanges = await getPendingChanges();
      setPendingChanges(allPendingChanges);
    };
    fetchPendingChanges();
  }, []);

  // const handleAddExaminer = async (newExaminers) => {
  //   // Assuming you have a function to add examiners to the backend
  //   await addExaminer(newExaminers);
  //   fetchExaminers(); // Fetch the updated list of examiners
  // };

  const handleAddPendingChange = useCallback(async (change: any) => {
    await addPendingChange(change);
    const allPendingChanges = await getPendingChanges();
    setPendingChanges(allPendingChanges);
  }, []);

  const handleUpdatePendingChange = useCallback(
    async (id: number, updatedChange: any) => {
      await updatePendingChange(id, updatedChange);
      const allPendingChanges = await getPendingChanges();
      setPendingChanges(allPendingChanges);
    },
    [],
  );

  const handleDeletePendingChange = useCallback(async (id: number) => {
    await deletePendingChange(id);
    const allPendingChanges = await getPendingChanges();
    setPendingChanges(allPendingChanges);
  }, []);

  // const handleGetPendingChanges = async () => {
  //   const allPendingChanges = await getPendingChanges();
  //   setPendingChanges(allPendingChanges);
  // };

  const handleAddQuestion = useCallback(async (newQuestion: any) => {
    await addQuestion(newQuestion);
    const allPendingChanges = await getPendingChanges();
    setPendingChanges(allPendingChanges);
    const allQuestions = await getQuestions();
    setQuestions(allQuestions);
  }, []);

  const handleApplyPendingChange = useCallback(async (id: number) => {
    await applyPendingChange(id);
    const allPendingChanges = await getPendingChanges();
    setPendingChanges(allPendingChanges);
    const allQuestions = await getQuestions();
    setQuestions(allQuestions);
  }, []);

  const handleApplyAllPendingChanges = useCallback(async () => {
    await applyAllPendingChanges();
    const allPendingChanges = await getPendingChanges();
    setPendingChanges(allPendingChanges);
    const allQuestions = await getQuestions();
    setQuestions(allQuestions);
  }, []);

  const handleDeleteQuestion = useCallback(
    async (deleteId: number, updatedChange: any) => {
      await deleteQuestion(deleteId, updatedChange);
      const allPendingChanges = await getPendingChanges();
      setPendingChanges(allPendingChanges);
      // const allQuestions = await getQuestions();
      // setQuestions(allQuestions);
    },
    [],
  );

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

  const handleDeleteExaminer = useCallback(
    async (id: number) => {
      await deleteExaminer(id);
      fetchExaminers();
    },
    [fetchExaminers],
  );

  const handleUpdateExaminer = useCallback(
    async (id: number, updatedExaminer: any) => {
      await updateExaminer(id, updatedExaminer);
      fetchExaminers();
    },
    [fetchExaminers],
  );

  const handleSaveSetting = useCallback(async (newSettings: any) => {
    await saveSetting(newSettings);
    const appSettings = await getAllSettings();
    setSettings(appSettings);
  }, []);

  const handleAddReviewPanel = useCallback(async (newReviewPanel: any) => {
    await addReviewPanel(newReviewPanel);
    const allReviewPanels = await getAllReviewPanels();
    setReviewPanels(allReviewPanels);
  }, []);

  const handleDeleteReviewPanel = useCallback(async (id: number) => {
    await deleteReviewPanel(id);
    const allReviewPanels = await getAllReviewPanels();
    setReviewPanels(allReviewPanels);
  }, []);

  const handleUpdateReviewPanel = useCallback(
    async (id: number, updatedReviewPanel: any) => {
      await updateReviewPanel(id, updatedReviewPanel);
      const allReviewPanels = await getAllReviewPanels();
      setReviewPanels(allReviewPanels);
    },
    [],
  );

  // Examiner assignments
  const handleAddExaminerAssignment = useCallback(
    async (newExaminerAssignment: any) => {
      await addExaminerAssignment(newExaminerAssignment);
      const allExaminerAssignments = await getAllExaminerAssignments();
      setExaminerAssignments(allExaminerAssignments);
    },
    [],
  );

  const handleDeleteExaminerAssignment = useCallback(async (id: number) => {
    await deleteExaminerAssignment(id);
    const allExaminerAssignments = await getAllExaminerAssignments();
    setExaminerAssignments(allExaminerAssignments);
  }, []);

  const handleUpdateExaminerAssignment = useCallback(
    async (id: number, updatedExaminerAssignment: any) => {
      await updateExaminerAssignment(id, updatedExaminerAssignment);
      const allExaminerAssignments = await getAllExaminerAssignments();
      setExaminerAssignments(allExaminerAssignments);
    },
    [],
  );

  // Syllabus sections
  const handleAddSyllabusSection = useCallback(
    async (newSyllabusSection: any) => {
      await addSyllabusSection(newSyllabusSection);
      const allSyllabusSections = await getAllSyllabusSections();
      setSyllabusSections(allSyllabusSections);
    },
    [],
  );

  const handleUpdateSyllabusSection = useCallback(
    async (id: number, updatedSyllabusSection: any) => {
      await updateSyllabusSection(id, updatedSyllabusSection);
      const allSyllabusSections = await getAllSyllabusSections();
      setSyllabusSections(allSyllabusSections);
    },
    [],
  );

  const handleDeleteSyllabusSection = useCallback(async (id: number) => {
    await deleteSyllabusSection(id);
    const allSyllabusSections = await getAllSyllabusSections();
    setSyllabusSections(allSyllabusSections);
  }, []);

  const contextValue = useMemo(
    () => ({
      questions,
      settings,
      examiners,
      reviewPanels,
      examinerAssignments,
      syllabusSections,
      handleAddQuestion,
      handleDeleteQuestion,
      pendingChanges,
      handleAddPendingChange,
      handleUpdatePendingChange,
      handleDeletePendingChange,
      handleApplyPendingChange,
      handleApplyAllPendingChanges,
      handleSaveSetting,
      handleAddExaminer,
      handleDeleteExaminer,
      handleUpdateExaminer,
      handleAddReviewPanel,
      handleDeleteReviewPanel,
      handleUpdateReviewPanel,
      handleAddExaminerAssignment,
      handleDeleteExaminerAssignment,
      handleUpdateExaminerAssignment,
      handleAddSyllabusSection,
      handleUpdateSyllabusSection,
      handleDeleteSyllabusSection,
    }),
    [
      questions,
      settings,
      examiners,
      reviewPanels,
      examinerAssignments,
      syllabusSections,
      pendingChanges,
      handleAddPendingChange,
      handleUpdatePendingChange,
      handleDeletePendingChange,
      // handleGetPendingChanges,
      handleApplyPendingChange,
      handleApplyAllPendingChanges,
      handleAddExaminer,
      handleDeleteExaminer,
      handleUpdateExaminer,
      handleDeleteReviewPanel,
      handleUpdateReviewPanel,
      handleAddQuestion,
      handleDeleteQuestion,
      handleSaveSetting,
      handleAddReviewPanel,
      handleAddExaminerAssignment,
      handleDeleteExaminerAssignment,
      handleUpdateExaminerAssignment,
      handleAddSyllabusSection,
      handleUpdateSyllabusSection,
      handleDeleteSyllabusSection,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
