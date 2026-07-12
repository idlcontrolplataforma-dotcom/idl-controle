import { useState, useEffect } from 'react';
import type { ColumnStatus, VSLProject, Editor, ReferralOption } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Kanban } from './components/Kanban';
import { Projetos } from './components/Projetos';
import { Clientes } from './components/Clientes';
import { Editores } from './components/Editores';
import { Relatorios } from './components/Relatorios';
import { Login } from './components/Login';
import { 
  X,
  Flame,
  CheckCircle,
  PlayCircle,
  MessageSquareCode,
  Cpu
} from 'lucide-react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

// Initial Editors data (which we will load into state)
const INITIAL_EDITORS: Editor[] = [
  { id: '1', name: 'Lucas Siqueira', role: 'Editor Sênior', avatarColor: 'from-purple-500 to-indigo-500' },
  { id: '2', name: 'Mariana Costa', role: 'Motion Designer', avatarColor: 'from-pink-500 to-rose-500' },
  { id: '3', name: 'Davi Fernandes', role: 'Editor Pleno', avatarColor: 'from-blue-500 to-cyan-500' },
  { id: '4', name: 'Ana Souza', role: 'Colorista Sênior', avatarColor: 'from-emerald-500 to-teal-500' }
];

// Initial mock projects data spread across columns (with entry dates and requiresAI flag)
const INITIAL_PROJECTS: VSLProject[] = [];

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [projects, setProjects] = useState<VSLProject[]>(INITIAL_PROJECTS);
  
  // Dynamic Editors State
  const [editors, setEditors] = useState<Editor[]>(INITIAL_EDITORS);

  // Global Period Selector State
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-07'); // Default to Julho/2026
  // Clickable Metric Filter State
  const [activeMetricFilter, setActiveMetricFilter] = useState<ColumnStatus | null>(null);

  // Dynamic Dropdown Filter States
  const [selectedEditorFilter, setSelectedEditorFilter] = useState<string>('All');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<VSLProject | null>(null);

  // Editor Modal states
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [newEditorName, setNewEditorName] = useState('');
  const [newEditorRole, setNewEditorRole] = useState('Editor Pleno');

  // Form states
  const [clientName, setClientName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editorId, setEditorId] = useState(INITIAL_EDITORS[0].id);
  const [status, setStatus] = useState<ColumnStatus>('waiting');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [dueDate, setDueDate] = useState('2026-07-07');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  
  // AI Integration Form States
  const [requiresAI, setRequiresAI] = useState(false);
  const [aiManagerName, setAiManagerName] = useState('');
  const [aiManagerCost, setAiManagerCost] = useState('');
  const [editorCost, setEditorCost] = useState('');
  const [referral, setReferral] = useState<ReferralOption>('Nenhum');
  const [comissionPercentage, setComissionPercentage] = useState<string>('0');
  const [adminPassword, setAdminPassword] = useState('admin');

  // Change Password Modal States
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 1. Fetch editors
        const editorsSnapshot = await getDocs(collection(db, 'editors'));
        let editorsList: Editor[] = [];
        if (editorsSnapshot.empty) {
          // If no editors are present, seed the Firestore with INITIAL_EDITORS
          const batch = writeBatch(db);
          INITIAL_EDITORS.forEach((editor) => {
            const editorRef = doc(db, 'editors', editor.id);
            batch.set(editorRef, editor);
          });
          await batch.commit();
          editorsList = [...INITIAL_EDITORS];
        } else {
          editorsSnapshot.forEach((doc) => {
            editorsList.push(doc.data() as Editor);
          });
        }
        setEditors(editorsList);

        // 2. Fetch settings/admin password
        const adminDocRef = doc(db, 'settings', 'admin');
        const adminDocSnap = await getDoc(adminDocRef);
        let currentAdminPassword = 'admin';
        if (!adminDocSnap.exists()) {
          await setDoc(adminDocRef, { password: 'admin' });
        } else {
          currentAdminPassword = adminDocSnap.data().password || 'admin';
        }
        setAdminPassword(currentAdminPassword);

        // 3. Fetch projects
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectsList: VSLProject[] = [];
        projectsSnapshot.forEach((doc) => {
          projectsList.push(doc.data() as VSLProject);
        });
        setProjects(projectsList);
      } catch (error) {
        console.error("Erro ao carregar dados do Firebase:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Drag and drop mechanics
  const handleMoveCard = async (id: string, destinationStatus: ColumnStatus) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, status: destinationStatus } : proj))
    );
    try {
      await updateDoc(doc(db, 'projects', id), { status: destinationStatus });
    } catch (error) {
      console.error("Erro ao mover card no Firebase:", error);
    }
  };

  // Open modal for creation
  const handleNewVSLClick = () => {
    setModalMode('create');
    setSelectedProject(null);
    setClientName('');
    setTitle('');
    setDescription('');
    // Default to first active editor in state
    setEditorId(editors.length > 0 ? editors[0].id : '');
    setStatus('waiting');
    setStartDate('2026-07-01');
    setDueDate('2026-07-07');
    setPriority('medium');
    setDuration('');
    setCategory('');
    setBudget('');
    setRequiresAI(false);
    setAiManagerName('');
    setAiManagerCost('');
    setEditorCost('');
    setReferral('Nenhum');
    setComissionPercentage('0');
    setIsModalOpen(true);
  };

  // Open modal for column-specific quick creation
  const handleQuickAdd = (colStatus: ColumnStatus) => {
    handleNewVSLClick();
    setStatus(colStatus);
  };

  // Open modal for editing
  const handleEditClick = (project: VSLProject) => {
    setModalMode('edit');
    setSelectedProject(project);
    setClientName(project.clientName);
    setTitle(project.title);
    setDescription(project.description || '');
    setEditorId(project.editor.id);
    setStatus(project.status);
    setStartDate(project.startDate);
    setDueDate(project.dueDate);
    setPriority(project.priority);
    setDuration(project.duration || '');
    setCategory(project.category || '');
    setBudget(project.budget || '');
    setRequiresAI(project.requiresAI || false);
    setAiManagerName(project.aiManagerName || '');
    setAiManagerCost(project.aiManagerCost || '');
    setEditorCost(project.editorCost || '');
    setReferral(project.referral || 'Nenhum');
    setComissionPercentage(project.comissionPercentage !== undefined ? String(project.comissionPercentage) : '0');
    setIsModalOpen(true);
  };

  // Submit modal form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedEditor = editors.find((ed) => ed.id === editorId) || editors[0];
    const parsedCommission = parseFloat(comissionPercentage);
    const validCommission = isNaN(parsedCommission) ? 0 : parsedCommission;

    if (modalMode === 'create') {
      const newProject: VSLProject = {
        id: `vsl-${Date.now()}`,
        clientName,
        title,
        description,
        editor: assignedEditor,
        status,
        startDate,
        dueDate,
        priority,
        duration: duration || undefined,
        category: category || undefined,
        budget: budget || undefined,
        requiresAI,
        aiManagerName: requiresAI ? aiManagerName : undefined,
        aiManagerCost: requiresAI ? aiManagerCost : undefined,
        editorCost: editorCost || undefined,
        referral,
        comissionPercentage: validCommission,
      };
      setProjects((prev) => [newProject, ...prev]);
      try {
        await setDoc(doc(db, 'projects', newProject.id), newProject);
      } catch (error) {
        console.error("Erro ao criar projeto no Firebase:", error);
      }
    } else if (modalMode === 'edit' && selectedProject) {
      const updatedProject: VSLProject = {
        ...selectedProject,
        clientName,
        title,
        description,
        editor: assignedEditor,
        status,
        startDate,
        dueDate,
        priority,
        duration: duration || undefined,
        category: category || undefined,
        budget: budget || undefined,
        requiresAI,
        aiManagerName: requiresAI ? aiManagerName : undefined,
        aiManagerCost: requiresAI ? aiManagerCost : undefined,
        editorCost: editorCost || undefined,
        referral,
        comissionPercentage: validCommission,
      };
      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === selectedProject.id ? updatedProject : proj
        )
      );
      try {
        await setDoc(doc(db, 'projects', selectedProject.id), updatedProject);
      } catch (error) {
        console.error("Erro ao editar projeto no Firebase:", error);
      }
    }
    setIsModalOpen(false);
  };

  const handleOpenChangePassword = () => {
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsChangePasswordModalOpen(true);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (currentPasswordInput !== adminPassword) {
      setPasswordError('A senha atual está incorreta.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('As senhas novas não coincidem.');
      return;
    }

    if (newPasswordInput.trim() === '') {
      setPasswordError('A nova senha não pode ser vazia.');
      return;
    }

    setAdminPassword(newPasswordInput);
    setPasswordSuccess('Senha alterada com sucesso!');
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    try {
      await setDoc(doc(db, 'settings', 'admin'), { password: newPasswordInput });
    } catch (error) {
      console.error("Erro ao alterar senha no Firebase:", error);
    }
  };

  // Delete project handler
  const handleDeleteProject = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      setProjects((prev) => prev.filter((proj) => proj.id !== id));
      setIsModalOpen(false);
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (error) {
        console.error("Erro ao excluir projeto no Firebase:", error);
      }
    }
  };

  // Add a new editor
  const handleAddEditorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const gradients = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
    ];
    const newEditor: Editor = {
      id: `editor-${Date.now()}`,
      name: newEditorName,
      role: newEditorRole,
      avatarColor: gradients[editors.length % gradients.length]
    };
    setEditors((prev) => [...prev, newEditor]);
    setIsEditorModalOpen(false);
    try {
      await setDoc(doc(db, 'editors', newEditor.id), newEditor);
    } catch (error) {
      console.error("Erro ao adicionar editor no Firebase:", error);
    }
  };

  // Remove an editor and redistribute their projects
  const handleDeleteEditor = async (id: string) => {
    if (editors.length <= 1) {
      alert('Não é possível remover o último editor. O sistema precisa de pelo menos um editor ativo.');
      return;
    }
    if (confirm('Tem certeza que deseja remover este editor? Os projetos associados a ele serão redistribuídos.')) {
      const remainingEditors = editors.filter((e) => e.id !== id);
      const fallbackEditor = remainingEditors[0];
      // Reassign projects to active fallback editor
      setProjects((prev) =>
        prev.map((p) => (p.editor.id === id ? { ...p, editor: fallbackEditor } : p))
      );
      setEditors(remainingEditors);

      try {
        // Delete editor from Firestore
        await deleteDoc(doc(db, 'editors', id));
        
        // Find and update all projects that were assigned to the deleted editor
        const batch = writeBatch(db);
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        projectsSnapshot.forEach((projDoc) => {
          const projData = projDoc.data() as VSLProject;
          if (projData.editor && projData.editor.id === id) {
            const docRef = doc(db, 'projects', projDoc.id);
            batch.update(docRef, { editor: fallbackEditor });
          }
        });
        await batch.commit();
      } catch (error) {
        console.error("Erro ao remover editor no Firebase:", error);
      }
    }
  };

  // Toggle dynamic metrics filter
  const toggleMetricFilter = (metricStatus: ColumnStatus) => {
    if (activeMetricFilter === metricStatus) {
      setActiveMetricFilter(null);
    } else {
      setActiveMetricFilter(metricStatus);
    }
  };

  // Dynamic available periods helper
  const getAvailablePeriods = (allProjects: VSLProject[]) => {
    const periods = new Set<string>();
    // Always include current month
    periods.add('2026-07');
    
    allProjects.forEach((p) => {
      if (p.startDate && p.startDate.length >= 7) {
        periods.add(p.startDate.slice(0, 7));
      }
      if (p.dueDate && p.dueDate.length >= 7) {
        periods.add(p.dueDate.slice(0, 7));
      }
    });

    const monthNames: { [key: string]: string } = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
      '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
      '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    };

    const list = Array.from(periods)
      .sort((a, b) => b.localeCompare(a))
      .map((p) => {
        const [year, month] = p.split('-');
        const monthLabel = monthNames[month] || month;
        return {
          value: p,
          label: `${monthLabel}/${year}`
        };
      });

    list.push({ value: 'all', label: 'Acumulado (Geral)' });
    return list;
  };

  const availablePeriods = getAvailablePeriods(projects);

  // Dynamic Option lists derived from global projects
  const uniqueEditorsList = Array.from(new Set(projects.map((proj) => proj.editor.name))).filter((name): name is string => !!name).sort();
  const uniqueClientsList = Array.from(new Set(projects.map((proj) => proj.clientName))).filter((name): name is string => !!name).sort();
  const uniqueCategoriesList = Array.from(new Set(projects.map((proj) => proj.category))).filter((cat): cat is string => !!cat).sort();

  // Projects filtered by selectedPeriod and searchTerm (ignores activeMetricFilter to count column sizes)
  const searchPeriodProjects = projects.filter((proj) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      proj.title.toLowerCase().includes(term) ||
      proj.clientName.toLowerCase().includes(term) ||
      proj.editor.name.toLowerCase().includes(term) ||
      (proj.category && proj.category.toLowerCase().includes(term))
    );
    const matchesMonth = selectedPeriod === 'all'
      ? true
      : (proj.dueDate.startsWith(selectedPeriod) || proj.startDate.startsWith(selectedPeriod));

    const matchesEditor = selectedEditorFilter === 'All' || selectedEditorFilter === ''
      ? true
      : proj.editor.name === selectedEditorFilter;

    const matchesClient = selectedClientFilter === 'All' || selectedClientFilter === ''
      ? true
      : proj.clientName === selectedClientFilter;

    const matchesCategory = selectedCategoryFilter === 'All' || selectedCategoryFilter === ''
      ? true
      : proj.category === selectedCategoryFilter;

    const matchesStage = selectedStageFilter === 'All' || selectedStageFilter === ''
      ? true
      : proj.status === selectedStageFilter;

    return matchesSearch && matchesMonth && matchesEditor && matchesClient && matchesCategory && matchesStage;
  });

  // Master filter combining Search, Month selector, and Clickable Metrics
  const filteredProjects = projects.filter((proj) => {
    const term = searchTerm.toLowerCase();
    
    const matchesSearch = (
      proj.title.toLowerCase().includes(term) ||
      proj.clientName.toLowerCase().includes(term) ||
      proj.editor.name.toLowerCase().includes(term) ||
      (proj.category && proj.category.toLowerCase().includes(term))
    );

    const matchesMonth = selectedPeriod === 'all'
      ? true
      : (proj.dueDate.startsWith(selectedPeriod) || proj.startDate.startsWith(selectedPeriod));

    const matchesMetric = activeMetricFilter === null
      ? true
      : proj.status === activeMetricFilter;

    const matchesEditor = selectedEditorFilter === 'All' || selectedEditorFilter === ''
      ? true
      : proj.editor.name === selectedEditorFilter;

    const matchesClient = selectedClientFilter === 'All' || selectedClientFilter === ''
      ? true
      : proj.clientName === selectedClientFilter;

    const matchesCategory = selectedCategoryFilter === 'All' || selectedCategoryFilter === ''
      ? true
      : proj.category === selectedCategoryFilter;

    const matchesStage = selectedStageFilter === 'All' || selectedStageFilter === ''
      ? true
      : proj.status === selectedStageFilter;

    return matchesSearch && matchesMonth && matchesMetric && matchesEditor && matchesClient && matchesCategory && matchesStage;
  });

  const periodFilteredProjects = projects.filter((proj) => {
    return selectedPeriod === 'all'
      ? true
      : (proj.dueDate.startsWith(selectedPeriod) || proj.startDate.startsWith(selectedPeriod));
  });

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#070913] text-slate-100 p-4 font-sans select-none relative overflow-hidden">
        {/* Premium ambient glow background design */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        
        <div className="flex flex-col items-center text-center relative z-10 space-y-6">
          <div className="w-16 h-16 border-4 border-t-violet-500 border-r-indigo-500 border-b-violet-500/20 border-l-violet-500/20 rounded-full animate-spin shadow-lg shadow-indigo-500/10" />
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-widest text-white uppercase bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
              IDL CONTROL
            </h2>
            <p className="text-xs text-slate-500 font-medium">Carregando painel de produção...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} adminPassword={adminPassword} />;
  }

  return (
    <div className="flex h-screen bg-[#070913] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header toolbar */}
        <Header 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onNewVSLClick={handleNewVSLClick}
          title={
            activeTab === 'dashboard' ? 'Painel de Produção VSL' :
            activeTab === 'editores' ? 'Diretório de Editores' :
            activeTab === 'clientes' ? 'Gestão de Clientes' :
            activeTab === 'projetos' ? 'Portfólio de Projetos' : 'Relatórios de Performance'
          }
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          availablePeriods={availablePeriods}
          onChangePasswordClick={handleOpenChangePassword}
          selectedEditor={selectedEditorFilter}
          setSelectedEditor={setSelectedEditorFilter}
          editorsList={uniqueEditorsList}
          selectedClient={selectedClientFilter}
          setSelectedClient={setSelectedClientFilter}
          clientsList={uniqueClientsList}
          selectedCategory={selectedCategoryFilter}
          setSelectedCategory={setSelectedCategoryFilter}
          categoriesList={uniqueCategoriesList}
          showFilters={activeTab === 'dashboard'}
          selectedStage={selectedStageFilter}
          setSelectedStage={setSelectedStageFilter}
        />

        {/* Dynamic Main Body Content */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#070913]">
            {/* Title Section */}
            <div className="px-8 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">
                  OPERAÇÕES
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Clique nas métricas para filtrar o quadro Kanban</p>
              </div>
            </div>

            {/* Clickable Top Metrics Bar */}
            <div className="px-8 pt-4 grid grid-cols-5 gap-6 select-none shrink-0">
              {/* GESTOR DE IA */}
              <div 
                onClick={() => toggleMetricFilter('ai')}
                className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 border ${
                  activeMetricFilter === 'ai'
                    ? 'bg-slate-900 border-purple-500 ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/5'
                    : 'bg-[#0e1322]/80 border-slate-800/80 hover:border-slate-700/80 hover:bg-[#121829]'
                }`}
              >
                <div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">GESTOR DE IA</p>
                  <p className="text-base font-extrabold text-purple-400 mt-0.5">
                    {searchPeriodProjects.filter(p => p.status === 'ai').length} PROJETOS
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${activeMetricFilter === 'ai' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Cpu className="w-4 h-4" />
                </div>
              </div>

              {/* FILA GERAL */}
              <div 
                onClick={() => toggleMetricFilter('waiting')}
                className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 border ${
                  activeMetricFilter === 'waiting'
                    ? 'bg-slate-900 border-violet-500 ring-2 ring-violet-500/20 shadow-lg shadow-violet-500/5'
                    : 'bg-[#0e1322]/80 border-slate-800/80 hover:border-slate-700/80 hover:bg-[#121829]'
                }`}
              >
                <div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">FILA GERAL</p>
                  <p className="text-base font-extrabold text-white mt-0.5">
                    {searchPeriodProjects.filter(p => p.status === 'waiting').length} PROJETOS
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${activeMetricFilter === 'waiting' ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-500'}`}>
                  <PlayCircle className="w-4 h-4" />
                </div>
              </div>

              {/* EM EDIÇÃO */}
              <div 
                onClick={() => toggleMetricFilter('editing')}
                className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 border ${
                  activeMetricFilter === 'editing'
                    ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/5'
                    : 'bg-[#0e1322]/80 border-slate-800/80 hover:border-slate-700/80 hover:bg-[#121829]'
                }`}
              >
                <div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">EM EDIÇÃO</p>
                  <p className="text-base font-extrabold text-amber-500 mt-0.5">
                    {searchPeriodProjects.filter(p => p.status === 'editing').length} PROJETOS
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${activeMetricFilter === 'editing' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Flame className="w-4 h-4" />
                </div>
              </div>

              {/* FINALIZADAS */}
              <div 
                onClick={() => toggleMetricFilter('done')}
                className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 border ${
                  activeMetricFilter === 'done'
                    ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5'
                    : 'bg-[#0e1322]/80 border-slate-800/80 hover:border-slate-700/80 hover:bg-[#121829]'
                }`}
              >
                <div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">FINALIZADAS</p>
                  <p className="text-base font-extrabold text-emerald-500 mt-0.5">
                    {searchPeriodProjects.filter(p => p.status === 'done').length} PROJETOS
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${activeMetricFilter === 'done' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>

              {/* REVISÃO */}
              <div 
                onClick={() => toggleMetricFilter('review')}
                className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 border ${
                  activeMetricFilter === 'review'
                    ? 'bg-slate-900 border-violet-500 ring-2 ring-violet-500/20 shadow-lg shadow-violet-500/5'
                    : 'bg-[#0e1322]/80 border-slate-800/80 hover:border-slate-700/80 hover:bg-[#121829]'
                }`}
              >
                <div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">REVISÃO</p>
                  <p className="text-base font-extrabold text-violet-400 mt-0.5">
                    {searchPeriodProjects.filter(p => p.status === 'review').length} PROJETOS
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${activeMetricFilter === 'review' ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-500'}`}>
                  <MessageSquareCode className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Kanban Board Container */}
            <Kanban
              projects={filteredProjects}
              onEditClick={handleEditClick}
              onMoveCard={handleMoveCard}
              onQuickAdd={handleQuickAdd}
            />
          </div>
        )}

        {/* Tab content placeholders */}
        {activeTab === 'editores' && (
          <Editores
            editors={editors}
            projects={filteredProjects}
            onAddEditorClick={() => {
              setNewEditorName('');
              setNewEditorRole('Editor Pleno');
              setIsEditorModalOpen(true);
            }}
            onDeleteEditor={handleDeleteEditor}
          />
        )}

        {activeTab === 'projetos' && (
          <Projetos projects={filteredProjects} onNewProjectClick={handleNewVSLClick} />
        )}

        {activeTab === 'clientes' && (
          <Clientes projects={filteredProjects} />
        )}

        {activeTab === 'relatorios' && (
          <Relatorios projects={periodFilteredProjects} />
        )}
      </div>

      {/* Creation/Editing Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
          <div className="relative w-full max-w-xl mx-4 bg-[#0f1425] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
              <h3 className="text-base font-bold text-white tracking-wide">
                {modalMode === 'create' ? 'Criar Novo Projeto' : 'Editar Informações do Projeto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Client Name Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                    placeholder="Ex: Saúde Plena"
                  />
                </div>

                {/* Category Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                    placeholder="Ex: Saúde, Finanças"
                  />
                </div>
              </div>

              {/* Title / Theme */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Título / Tema do Projeto *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                  placeholder="Ex: VSL Emagrecimento Rápido"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Briefing / Instruções de Edição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200 resize-none"
                  placeholder="Briefing rápido para os editores..."
                />
              </div>

              {/* Indicação & Comissão Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Indicação dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Indicação *
                  </label>
                  <select
                    required
                    value={referral}
                    onChange={(e) => setReferral(e.target.value as ReferralOption)}
                    className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-300 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                  >
                    <option value="Nenhum" className="bg-[#0f1425] text-slate-200">Nenhum</option>
                    <option value="Higor Neves" className="bg-[#0f1425] text-slate-200">Higor Neves</option>
                    <option value="Ferini" className="bg-[#0f1425] text-slate-200">Ferini</option>
                    <option value="Augusto e Geraldo" className="bg-[#0f1425] text-slate-200">Augusto e Geraldo</option>
                    <option value="Gabriel Rebouças" className="bg-[#0f1425] text-slate-200">Gabriel Rebouças</option>
                    <option value="HE" className="bg-[#0f1425] text-slate-200">HE</option>
                    <option value="Outros" className="bg-[#0f1425] text-slate-200">Outros</option>
                  </select>
                </div>

                {/* Porcentagem da Comissão (%) */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Porcentagem da Comissão (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={comissionPercentage}
                    onChange={(e) => setComissionPercentage(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                    placeholder="Ex: 10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Assigned Editor Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Editor Responsável
                  </label>
                  <select
                    value={editorId}
                    onChange={(e) => setEditorId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-300 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                  >
                    {editors.map((editor) => (
                      <option key={editor.id} value={editor.id} className="bg-slate-950 text-slate-200">
                        {editor.name} ({editor.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Column Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Coluna / Etapa
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ColumnStatus)}
                    className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-300 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                  >
                    <option value="waiting" className="bg-slate-950 text-slate-200">FILA GERAL</option>
                    <option value="ai" className="bg-slate-950 text-slate-200">GESTOR DE IA</option>
                    <option value="editing" className="bg-slate-950 text-slate-200">EM EDIÇÃO</option>
                    <option value="done" className="bg-slate-950 text-slate-200">FINALIZADAS</option>
                    <option value="review" className="bg-slate-950 text-slate-200">REVISÃO</option>
                  </select>
                </div>
              </div>

              {/* Date pickers (Start Date and Due Date) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Data de Entrada *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-300 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Prazo Final *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-300 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Duration, Budget and Editor Cost */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Duração Est.
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                    placeholder="Ex: 12:45"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Custo / Orçamento
                  </label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-2 bg-[#070b14] border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                    placeholder="Ex: R$ 1.500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Custo do Editor (R$)
                  </label>
                  <input
                    type="text"
                    value={editorCost}
                    onChange={(e) => setEditorCost(e.target.value)}
                    className="w-full px-4 py-2 bg-[#070b14] border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                    placeholder="Ex: R$ 500"
                  />
                </div>
              </div>

              {/* AI Integration Section */}
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-250">Requer Gestão de IA?</span>
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5">Ativar coordenador e orçamento de IA para este projeto</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={requiresAI}
                    onChange={(e) => setRequiresAI(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 bg-slate-950 border-slate-800 focus:ring-violet-500 focus:ring-offset-slate-900 focus:ring-2 cursor-pointer"
                  />
                </div>

                {requiresAI && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/40 animate-fadeIn">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Nome do Gestor de IA *
                      </label>
                      <input
                        type="text"
                        required={requiresAI}
                        value={aiManagerName}
                        onChange={(e) => setAiManagerName(e.target.value)}
                        className="w-full px-4 py-2 bg-[#070b14] border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                        placeholder="Ex: Gabriel Ramos"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Custo Gestor de IA (R$) *
                      </label>
                      <input
                        type="text"
                        required={requiresAI}
                        value={aiManagerCost}
                        onChange={(e) => setAiManagerCost(e.target.value)}
                        className="w-full px-4 py-2 bg-[#070b14] border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                        placeholder="Ex: R$ 600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Nível de Prioridade
                </label>
                <div className="flex gap-4">
                  {(['low', 'medium', 'high'] as const).map((pri) => (
                    <label
                      key={pri}
                      className={`flex-1 flex items-center justify-center py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 select-none ${
                        priority === pri
                          ? pri === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/40 ring-1 ring-rose-500/20'
                            : pri === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 ring-1 ring-amber-500/20'
                            : 'bg-sky-500/10 text-sky-400 border-sky-500/40 ring-1 ring-sky-500/20'
                          : 'bg-slate-950/40 text-slate-400 border-slate-850 hover:bg-slate-900/60 hover:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={pri}
                        checked={priority === pri}
                        onChange={() => setPriority(pri)}
                        className="sr-only"
                      />
                      {pri === 'high' ? 'Alta' : pri === 'medium' ? 'Média' : 'Baixa'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                {modalMode === 'edit' && selectedProject ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(selectedProject.id)}
                    className="px-4 py-2 border border-rose-500/30 hover:border-rose-500/80 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 rounded-xl text-xs font-semibold transition-all duration-200"
                  >
                    Excluir VSL
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/10 hover:shadow-lg transition-all duration-200"
                  >
                    {modalMode === 'create' ? 'Salvar VSL' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editor Creation Modal */}
      {isEditorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
          <div className="relative w-full max-w-md mx-4 bg-[#0f1425] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
              <h3 className="text-base font-bold text-white tracking-wide">
                Adicionar Novo Editor
              </h3>
              <button
                onClick={() => setIsEditorModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddEditorSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newEditorName}
                  onChange={(e) => setNewEditorName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                  placeholder="Ex: Carlos Oliveira"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Cargo / Especialidade
                </label>
                <select
                  value={newEditorRole}
                  onChange={(e) => setNewEditorRole(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-350 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                >
                  <option value="Editor Sênior">Editor Sênior</option>
                  <option value="Editor Pleno">Editor Pleno</option>
                  <option value="Editor Júnior">Editor Júnior</option>
                  <option value="Motion Designer">Motion Designer</option>
                  <option value="Colorista Sênior">Colorista Sênior</option>
                  <option value="Sonoplasta Pleno">Sonoplasta Pleno</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/10 hover:shadow-lg transition-all duration-200"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
          <div className="relative w-full max-w-md mx-4 bg-[#0f1425] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
              <h3 className="text-base font-bold text-white tracking-wide">
                Trocar Senha de Acesso
              </h3>
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-shake">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  {passwordSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Senha Atual *
                </label>
                <input
                  type="password"
                  required
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                  placeholder="Sua senha atual"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nova Senha *
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                  placeholder="Escolha uma nova senha"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Confirmar Nova Senha *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:bg-slate-950 transition-colors duration-200"
                  placeholder="Repita a nova senha"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-all duration-200"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/10 hover:shadow-lg transition-all duration-200"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
