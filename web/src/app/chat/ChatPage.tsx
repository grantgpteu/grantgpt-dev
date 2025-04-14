"use client";

import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  BackendChatSession,
  BackendMessage,
  BUFFER_COUNT,
  ChatFileType,
  ChatSessionSharedStatus,
  FileDescriptor,
  FileChatDisplay,
  Message,
  MessageResponseIDInfo,
  RetrievalType,
  StreamingError,
  ToolCallMetadata,
  SubQuestionDetail,
  constructSubQuestions,
  DocumentsResponse,
  AgenticMessageResponseIDInfo,
  UserKnowledgeFilePacket,
} from "./interfaces";

import Prism from "prismjs";
import Cookies from "js-cookie";
import { HistorySidebar } from "./sessionSidebar/HistorySidebar";
import { Persona } from "../admin/assistants/interfaces";
import { HealthCheckBanner } from "@/components/health/healthcheck";
import {
  buildChatUrl,
  buildLatestMessageChain,
  createChatSession,
  getCitedDocumentsFromMessage,
  getHumanAndAIMessageFromMessageNumber,
  getLastSuccessfulMessageId,
  handleChatFeedback,
  nameChatSession,
  PacketType,
  personaIncludesRetrieval,
  processRawChatHistory,
  removeMessage,
  sendMessage,
  setMessageAsLatest,
  updateLlmOverrideForChatSession,
  updateParentChildren,
  uploadFilesForChat,
  useScrollonStream,
} from "./lib";
import {
  Dispatch,
  SetStateAction,
  use,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePopup } from "@/components/admin/connectors/Popup";
import { SEARCH_PARAM_NAMES, shouldSubmitOnLoad } from "./searchParams";
import { LlmDescriptor, useFilters, useLlmManager } from "@/lib/hooks";
import { ChatState, FeedbackType, RegenerationState } from "./types";
import { DocumentResults } from "./documentSidebar/DocumentResults";
import { OnyxInitializingLoader } from "@/components/OnyxInitializingLoader";
import FixedLogo from "@/components/logo/FixedLogo";
import { FeedbackModal } from "./modal/FeedbackModal";
import { ShareChatSessionModal } from "./modal/ShareChatSessionModal";
import { FiArrowDown } from "react-icons/fi";
import { ChatIntro } from "./ChatIntro";
import { AIMessage, HumanMessage } from "./message/Messages";
import { StarterMessages } from "../../components/assistants/StarterMessage";
import {
  AnswerPiecePacket,
  OnyxDocument,
  DocumentInfoPacket,
  StreamStopInfo,
  StreamStopReason,
  SubQueryPiece,
  SubQuestionPiece,
  AgentAnswerPiece,
  RefinedAnswerImprovement,
  MinimalOnyxDocument,
} from "@/lib/search/interfaces";
import { buildFilters } from "@/lib/search/utils";
import { SettingsContext } from "@/components/settings/SettingsProvider";
import Dropzone from "react-dropzone";
import {
  checkLLMSupportsImageInput,
  getFinalLLM,
  structureValue,
} from "@/lib/llm/utils";
import { ChatInputBar } from "./input/ChatInputBar";
import { useChatContext } from "@/components/context/ChatContext";
import { v4 as uuidv4 } from "uuid";
import { ChatPopup } from "./ChatPopup";
import FunctionalHeader from "@/components/chat/Header";
import { useSidebarVisibility } from "@/components/chat/hooks";
import {
  PRO_SEARCH_TOGGLED_COOKIE_NAME,
  SIDEBAR_TOGGLED_COOKIE_NAME,
} from "@/components/resizable/constants";

import ExceptionTraceModal from "@/components/modals/ExceptionTraceModal";

import {
  INTERNET_SEARCH_TOOL_ID,
  SEARCH_TOOL_ID,
  SEARCH_TOOL_NAME,
} from "./tools/constants";
import { useUser } from "@/components/user/UserProvider";
import { ApiKeyModal } from "@/components/llm/ApiKeyModal";
import BlurBackground from "../../components/chat/BlurBackground";
import { NoAssistantModal } from "@/components/modals/NoAssistantModal";
import { useAssistants } from "@/components/context/AssistantsContext";
import TextView from "@/components/chat/TextView";
import { Modal } from "@/components/Modal";
import { useSendMessageToParent } from "@/lib/extension/utils";
import {
  CHROME_MESSAGE,
  SUBMIT_MESSAGE_TYPES,
} from "@/lib/extension/constants";

import { getSourceMetadata } from "@/lib/sources";
import { UserSettingsModal } from "./modal/UserSettingsModal";
import { AgenticMessage } from "./message/AgenticMessage";
import AssistantModal from "../assistants/mine/AssistantModal";
import { useSidebarShortcut } from "@/lib/browserUtilities";
import { FilePickerModal } from "./my-documents/components/FilePicker";

import { SourceMetadata } from "@/lib/search/interfaces";
import { ValidSources } from "@/lib/types";
import {
  FileUploadResponse,
  FileResponse,
  FolderResponse,
  useDocumentsContext,
} from "./my-documents/DocumentsContext";
import { ChatSearchModal } from "./chat_search/ChatSearchModal";
import { ErrorBanner } from "./message/Resubmit";
import MinimalMarkdown from "@/components/chat/MinimalMarkdown";

// Constants
const TEMP_USER_MESSAGE_ID = -1;
const TEMP_ASSISTANT_MESSAGE_ID = -2;
const SYSTEM_MESSAGE_ID = -3;
const AUTO_SCROLL_ENABLED = true;

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function ChatPage({
  toggle,
  documentSidebarInitialWidth,
  sidebarVisible,
  firstMessage,
  initialFolders,
  initialFiles,
}: {
  toggle: (toggled?: boolean) => void;
  documentSidebarInitialWidth?: number;
  sidebarVisible: boolean;
  firstMessage?: string;
  initialFolders?: any;
  initialFiles?: any;
}): JSX.Element {
  // Initialize refs
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const waitForScrollRef = useRef<boolean>(false);
  const hasPerformedInitialScroll = useRef<boolean>(false);
  const scrollInitialized = useRef<boolean>(false);

  // Function declarations
  const onSubmit = async ({ 
    messageOverride, 
    overrideFileDescriptors, 
    isSeededChat 
  }: { 
    messageOverride?: string;
    overrideFileDescriptors?: FileDescriptor[];
    isSeededChat?: boolean;
  } = {}) => {
    // Implementation to be added
  };

  const clearSelectedDocuments = () => {
    // Implementation to be added
  };

  const setHasPerformedInitialScroll = (value: boolean) => {
    hasPerformedInitialScroll.current = value;
  };

  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    chatSessions,
    ccPairs,
    tags,
    documentSets,
    llmProviders,
    folders,
    shouldShowWelcomeModal,
    refreshChatSessions,
    proSearchToggled,
  } = useChatContext();

  const {
    selectedFiles,
    selectedFolders,
    addSelectedFile,
    addSelectedFolder,
    removeSelectedFolder,
    clearSelectedItems,
    folders: userFolders,
    files: allUserFiles,
    uploadFile,
    removeSelectedFile,
    currentMessageFiles,
    setCurrentMessageFiles,
  } = useDocumentsContext();

  const defaultAssistantIdRaw = searchParams?.get(
    SEARCH_PARAM_NAMES.PERSONA_ID
  );
  const defaultAssistantId = defaultAssistantIdRaw
    ? parseInt(defaultAssistantIdRaw)
    : undefined;

  // Function declarations need to be outside of blocks in strict mode
  function useScreenSize() {
    const [screenSize, setScreenSize] = useState({
      width: typeof window !== "undefined" ? window.innerWidth : 0,
      height: typeof window !== "undefined" ? window.innerHeight : 0,
    });

    useEffect(() => {
      const handleResize = () => {
        setScreenSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return screenSize;
  }

  // handle redirect if chat page is disabled
  // NOTE: this must be done here, in a client component since
  // settings are passed in via Context and therefore aren't
  // available in server-side components
  const settings = useContext(SettingsContext);
  const enterpriseSettings = settings?.enterpriseSettings;

  const [viewingFilePicker, setViewingFilePicker] = useState(false);
  const [toggleDocSelection, setToggleDocSelection] = useState(false);
  const [documentSidebarVisible, setDocumentSidebarVisible] = useState(false);
  const [proSearchEnabled, setProSearchEnabled] = useState(proSearchToggled);
  const toggleProSearch = () => {
    Cookies.set(
      PRO_SEARCH_TOGGLED_COOKIE_NAME,
      String(!proSearchEnabled).toLocaleLowerCase()
    );
    setProSearchEnabled(!proSearchEnabled);
  };

  const isInitialLoad = useRef(true);
  const [userSettingsToggled, setUserSettingsToggled] = useState(false);

  const { assistants: availableAssistants, pinnedAssistants } = useAssistants();

  const [showApiKeyModal, setShowApiKeyModal] = useState(
    !shouldShowWelcomeModal
  );

  const { user, isAdmin } = useUser();
  const slackChatId = searchParams?.get("slackChatId");
  const existingChatIdRaw = searchParams?.get("chatId");

  const [showHistorySidebar, setShowHistorySidebar] = useState(false);

  const existingChatSessionId = existingChatIdRaw ? existingChatIdRaw : null;

  const selectedChatSession = chatSessions.find(
    (chatSession) => chatSession.id === existingChatSessionId
  );

  useEffect(() => {
    if (user?.is_anonymous_user) {
      Cookies.set(
        SIDEBAR_TOGGLED_COOKIE_NAME,
        String(!sidebarVisible).toLocaleLowerCase()
      );
      toggle(false);
    }
  }, [user, sidebarVisible, toggle]);

  const processSearchParamsAndSubmitMessage = (searchParamsString: string) => {
    const newSearchParams = new URLSearchParams(searchParamsString);
    const message = newSearchParams?.get("user-prompt");

    filterManager.buildFiltersFromQueryString(
      newSearchParams.toString(),
      availableSources,
      documentSets.map((ds) => ds.name),
      tags
    );

    const fileDescriptorString = newSearchParams?.get(SEARCH_PARAM_NAMES.FILES);
    const overrideFileDescriptors: FileDescriptor[] = fileDescriptorString
      ? JSON.parse(decodeURIComponent(fileDescriptorString))
      : [];

    newSearchParams.delete(SEARCH_PARAM_NAMES.SEND_ON_LOAD);

    router.replace(`?${newSearchParams.toString()}`, { scroll: false });

    // If there's a message, submit it
    if (message) {
      setSubmittedMessage(message);
      onSubmit({ messageOverride: message, overrideFileDescriptors });
    }
  };

  const chatSessionIdRef = useRef<string | null>(existingChatSessionId);

  // Only updates on session load (ie. rename / switching chat session)
  // Useful for determining which session has been loaded (i.e. still on `new, empty session` or `previous session`)
  const loadedIdSessionRef = useRef<string | null>(existingChatSessionId);

  const existingChatSessionAssistantId = selectedChatSession?.persona_id;
  const [selectedAssistant, setSelectedAssistant] = useState<
    Persona | undefined
  >(
    // NOTE: look through available assistants here, so that even if the user
    // has hidden this assistant it still shows the correct assistant when
    // going back to an old chat session
    existingChatSessionAssistantId !== undefined
      ? availableAssistants.find(
          (assistant) => assistant.id === existingChatSessionAssistantId
        )
      : defaultAssistantId !== undefined
        ? availableAssistants.find(
            (assistant) => assistant.id === defaultAssistantId
          )
        : undefined
  );
  // Gather default temperature settings
  const search_param_temperature = searchParams?.get(
    SEARCH_PARAM_NAMES.TEMPERATURE
  );

  const setSelectedAssistantFromId = (assistantId: number) => {
    // NOTE: also intentionally look through available assistants here, so that
    // even if the user has hidden an assistant they can still go back to it
    // for old chats
    setSelectedAssistant(
      availableAssistants.find((assistant) => assistant.id === assistantId)
    );
  };

  const [alternativeAssistant, setAlternativeAssistant] =
    useState<Persona | null>(null);

  const [presentingDocument, setPresentingDocument] =
    useState<MinimalOnyxDocument | null>(null);

  // Current assistant is decided based on this ordering
  // 1. Alternative assistant (assistant selected explicitly by user)
  // 2. Selected assistant (assistnat default in this chat session)
  // 3. First pinned assistants (ordered list of pinned assistants)
  // 4. Available assistants (ordered list of available assistants)
  // Relevant test: `live_assistant.spec.ts`
  const liveAssistant: Persona | undefined = useMemo(
    () =>
      alternativeAssistant ||
      selectedAssistant ||
      pinnedAssistants[0] ||
      availableAssistants[0],
    [
      alternativeAssistant,
      selectedAssistant,
      pinnedAssistants,
      availableAssistants,
    ]
  );

  const llmManager = useLlmManager(
    llmProviders,
    selectedChatSession,
    liveAssistant
  );

  const noAssistants = liveAssistant == null || liveAssistant == undefined;

  const availableSources: ValidSources[] = useMemo(() => {
    return ccPairs.map((ccPair) => ccPair.source);
  }, [ccPairs]);

  const sources: SourceMetadata[] = useMemo(() => {
    const uniqueSources = Array.from(new Set(availableSources));
    return uniqueSources.map((source) => getSourceMetadata(source));
  }, [availableSources]);

  const stopGenerating = () => {
    const currentSession = currentSessionId();
    const controller = abortControllers.get(currentSession);
    if (controller) {
      controller.abort();
      setAbortControllers((prev) => {
        const newControllers = new Map(prev);
        newControllers.delete(currentSession);
        return newControllers;
      });
    }

    const lastMessage = messageHistory[messageHistory.length - 1];
    if (
      lastMessage &&
      lastMessage.type === "assistant" &&
      lastMessage.toolCall &&
      lastMessage.toolCall.tool_result === undefined
    ) {
      const newCompleteMessageMap = new Map(
        currentMessageMap(completeMessageDetail)
      );
      const updatedMessage = { ...lastMessage, toolCall: null };
      newCompleteMessageMap.set(lastMessage.messageId, updatedMessage);
      updateCompleteMessageDetail(currentSession, newCompleteMessageMap);
    }

    updateChatState("input", currentSession);
  };

  // this is for "@"ing assistants

  // this is used to track which assistant is being used to generate the current message
  // for example, this would come into play when:
  // 1. default assistant is `Onyx`
  // 2. we "@"ed the `GPT` assistant and sent a message
  // 3. while the `GPT` assistant message is generating, we "@" the `Paraphrase` assistant
  const [alternativeGeneratingAssistant, setAlternativeGeneratingAssistant] =
    useState<Persona | null>(null);

  // used to track whether or not the initial "submit on load" has been performed
  // this only applies if `?submit-on-load=true` or `?submit-on-load=1` is in the URL
  // NOTE: this is required due to React strict mode, where all `useEffect` hooks
  // are run twice on initial load during development
  const submitOnLoadPerformed = useRef<boolean>(false);

  const { popup, setPopup } = usePopup();

  // fetch messages for the chat session
  const [isFetchingChatMessages, setIsFetchingChatMessages] = useState(
    existingChatSessionId !== null
  );

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
    setIsReady(true);
  }, []);

  useEffect(() => {
    const priorChatSessionId = chatSessionIdRef.current;
    const loadedSessionId = loadedIdSessionRef.current;
    chatSessionIdRef.current = existingChatSessionId;
    loadedIdSessionRef.current = existingChatSessionId;

    textAreaRef.current?.focus();

    // only clear things if we're going from one chat session to another
    const isChatSessionSwitch = existingChatSessionId !== priorChatSessionId;
    if (isChatSessionSwitch) {
      // de-select documents

      // reset all filters
      filterManager.setSelectedDocumentSets([]);
      filterManager.setSelectedSources([]);
      filterManager.setSelectedTags([]);
      filterManager.setTimeRange(null);

      // remove uploaded files
      setCurrentMessageFiles([]);

      // if switching from one chat to another, then need to scroll again
      // if we're creating a brand new chat, then don't need to scroll
      if (chatSessionIdRef.current !== null) {
        clearSelectedDocuments();
        setHasPerformedInitialScroll(false);
      }
    }

    async function initialSessionFetch() {
      if (existingChatSessionId === null) {
        setIsFetchingChatMessages(false);
        if (defaultAssistantId !== undefined) {
          setSelectedAssistantFromId(defaultAssistantId);
        } else {
          setSelectedAssistant(undefined);
        }
        updateCompleteMessageDetail(null, new Map());
        setChatSessionSharedStatus(ChatSessionSharedStatus.Private);

        // if we're supposed to submit on initial load, then do that here
        if (
          shouldSubmitOnLoad(searchParams) &&
          !submitOnLoadPerformed.current
        ) {
          submitOnLoadPerformed.current = true;
          await onSubmit();
        }
        return;
      }

      setIsFetchingChatMessages(true);
      const response = await fetch(
        `/api/chat/get-chat-session/${existingChatSessionId}`
      );

      const session = await response.json();
      const chatSession = session as BackendChatSession;
      setSelectedAssistantFromId(chatSession.persona_id);

      const newMessageMap = processRawChatHistory(chatSession.messages);
      const newMessageHistory = buildLatestMessageChain(newMessageMap);

      // Update message history except for edge where where
      // last message is an error and we're on a new chat.
      // This corresponds to a "renaming" of chat, which occurs after first message
      // stream
      if (
        (messageHistory[messageHistory.length - 1]?.type !== "error" ||
          loadedSessionId != null) &&
        !currentChatAnswering()
      ) {
        const latestMessageId =
          newMessageHistory[newMessageHistory.length - 1]?.messageId;

        setSelectedMessageForDocDisplay(
          latestMessageId !== undefined ? latestMessageId : null
        );

        updateCompleteMessageDetail(chatSession.chat_session_id, newMessageMap);
      }

      setChatSessionSharedStatus(chatSession.shared_status);

      // go to bottom. If initial load, then do a scroll,
      // otherwise just appear at the bottom

      scrollInitialized.current = false;

      if (!hasPerformedInitialScroll) {
        if (isInitialLoad.current) {
          setHasPerformedInitialScroll(true);
          isInitialLoad.current = false;
        }
        clientScrollToBottom();

        setTimeout(() => {
          setHasPerformedInitialScroll(true);
        }, 100);
      } else if (isChatSessionSwitch) {
        setHasPerformedInitialScroll(true);
        clientScrollToBottom(true);
      }

      setIsFetchingChatMessages(false);

      // if this is a seeded chat, then kick off the AI message generation
      if (
        newMessageHistory.length === 1 &&
        !submitOnLoadPerformed.current &&
        searchParams?.get(SEARCH_PARAM_NAMES.SEEDED) === "true"
      ) {
        submitOnLoadPerformed.current = true;
        const seededMessage = newMessageHistory[0].message;
        await onSubmit({
          isSeededChat: true,
          messageOverride: seededMessage,
        });
        // force re-name if the chat session doesn't have one
        if (!chatSession.description) {
          await nameChatSession(existingChatSessionId);
          refreshChatSessions();
        }
      } else if (newMessageHistory.length === 2 && !chatSession.description) {
        await nameChatSession(existingChatSessionId);
        refreshChatSessions();
      }
    }

    initialSessionFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    existingChatSessionId,
    searchParams,
    defaultAssistantId,
    setSelectedAssistantFromId,
    setCurrentMessageFiles,
    clearSelectedDocuments,
    setHasPerformedInitialScroll,
    onSubmit,
    nameChatSession,
    refreshChatSessions
    // Note: Functions and values defined within the component can be used in
    // effects without being listed in the dependency array, as they're stable
    // references as long as their dependencies don't change
  ]);

  useEffect(() => {
    const userFolderId = searchParams?.get(SEARCH_PARAM_NAMES.USER_FOLDER_ID);
    const allMyDocuments = searchParams?.get(
      SEARCH_PARAM_NAMES.ALL_MY_DOCUMENTS
    );

    if (userFolderId) {
      const userFolder = userFolders.find(
        (folder) => folder.id === parseInt(userFolderId)
      );
      if (userFolder) {
        addSelectedFolder(userFolder);
      }
    } else if (allMyDocuments === "true" || allMyDocuments === "1") {
      // Clear any previously selected folders

      clearSelectedItems();

      // Add all user folders to the current context
      userFolders.forEach((folder) => {
        addSelectedFolder(folder);
      });
    }
  }, [
    userFolders,
    searchParams?.get(SEARCH_PARAM_NAMES.USER_FOLDER_ID),
    searchParams?.get(SEARCH_PARAM_NAMES.ALL_MY_DOCUMENTS),
    addSelectedFolder,
    clearSelectedItems,
  ]);

  const [message, setMessage] = useState(
    searchParams?.get(SEARCH_PARAM_NAMES.USER_PROMPT) || ""
  );

  const [completeMessageDetail, setCompleteMessageDetail] = useState<
    Map<string | null, Map<number, Message>>
  >(new Map());

  const updateCompleteMessageDetail = (
    sessionId: string | null,
    messageMap: Map<number, Message>
  ) => {
    setCompleteMessageDetail((prevState) => {
      const newState = new Map(prevState);
      newState.set(sessionId, messageMap);
      return newState;
    });
  };

  const currentMessageMap = (
    messageDetail: Map<string | null, Map<number, Message>>
  ) => {
    return (
      messageDetail.get(chatSessionIdRef.current) || new Map<number, Message>()
    );
  };
  const currentSessionId = (): string => {
    return chatSessionIdRef.current!;
  };

  const upsertToCompleteMessageMap = ({
    messages,
    completeMessageMapOverride,
    chatSessionId,
    replacementsMap = null,
    makeLatestChildMessage = false,
  }: {
    messages: Message[];
    // if calling this function repeatedly with short delay, stay may not update in time
    // and result in weird behavipr
    completeMessageMapOverride?: Map<number, Message> | null;
    chatSessionId?: string;
    replacementsMap?: Map<number, number> | null;
    makeLatestChildMessage?: boolean;
  }) => {
    // deep copy
    const frozenCompleteMessageMap =
      completeMessageMapOverride || currentMessageMap(completeMessageDetail);
    const newCompleteMessageMap = structuredClone(frozenCompleteMessageMap);

    if (newCompleteMessageMap.size === 0) {
      const systemMessageId = messages[0].parentMessageId || SYSTEM_MESSAGE_ID;
      const firstMessageId = messages[0].messageId;
      const dummySystemMessage: Message = {
        messageId: systemMessageId,
        message: "",
        type: "system",
        files: [],
        toolCall: null,
        parentMessageId: null,
        childrenMessageIds: [firstMessageId],
        latestChildMessageId: firstMessageId,
      };
      newCompleteMessageMap.set(
        dummySystemMessage.messageId,
        dummySystemMessage
      );
      messages[0].parentMessageId = systemMessageId;
    }

    messages.forEach((message) => {
      const idToReplace = replacementsMap?.get(message.messageId);
      if (idToReplace) {
        removeMessage(idToReplace, newCompleteMessageMap);
      }

      // update childrenMessageIds for the parent
      if (
        !newCompleteMessageMap.has(message.messageId) &&
        message.parentMessageId !== null
      ) {
        updateParentChildren(message, newCompleteMessageMap, true);
      }
      newCompleteMessageMap.set(message.messageId, message);
    });
    // if specified, make these new message the latest of the current message chain
    if (makeLatestChildMessage) {
      const currentMessageChain = buildLatestMessageChain(
        frozenCompleteMessageMap
      );
      const latestMessage = currentMessageChain[currentMessageChain.length - 1];
      if (latestMessage) {
        newCompleteMessageMap.get(
          latestMessage.messageId
        )!.latestChildMessageId = messages[0].messageId;
      }
    }

    const newCompleteMessageDetail = {
      sessionId: chatSessionId || currentSessionId(),
      messageMap: newCompleteMessageMap,
    };

    updateCompleteMessageDetail(
      chatSessionId || currentSessionId(),
      newCompleteMessageMap
    );
    return newCompleteMessageDetail;
  };

  const messageHistory = buildLatestMessageChain(
    currentMessageMap(completeMessageDetail)
  );

  const [submittedMessage, setSubmittedMessage] = useState(firstMessage || "");

  const [chatState, setChatState] = useState<Map<string | null, ChatState>>(
    new Map([[chatSessionIdRef.current, firstMessage ? "loading" : "input"]])
  );

  const [regenerationState, setRegenerationState] = useState<
    Map<string | null, RegenerationState | null>
  >(new Map([[null, null]]));

  const [abortControllers, setAbortControllers] = useState<
    Map<string | null, AbortController>
  >(new Map());

  // Updates "null" session values to new session id for
  // regeneration, chat, and abort controller state, messagehistory
  const updateStatesWithNewSessionId = (newSessionId: string) => {
    const updateState = (
      setState: Dispatch<SetStateAction<Map<string | null, any>>>,
      defaultValue?: any
    ) => {
      setState((prevState) => {
        const newState = new Map(prevState);
        const existingState = newState.get(null);
        if (existingState !== undefined) {
          newState.set(newSessionId, existingState);
          newState.delete(null);
        } else if (defaultValue !== undefined) {
          newState.set(newSessionId, defaultValue);
        }
        return newState;
      });
    };

    updateState(setRegenerationState);
    updateState(setChatState);
    updateState(setAbortControllers);

    // Update completeMessageDetail
    setCompleteMessageDetail((prevState) => {
      const newState = new Map(prevState);
      const existingMessages = newState.get(null);
      if (existingMessages) {
        newState.set(newSessionId, existingMessages);
        newState.delete(null);
      }
      return newState;
    });

    // Update chatSessionIdRef
    chatSessionIdRef.current = newSessionId;
  };

  const updateChatState = (newState: ChatState, sessionId?: string | null) => {
    setChatState((prevState) => {
      const newChatState = new Map(prevState);
      newChatState.set(
        sessionId !== undefined ? sessionId : currentSessionId(),
        newState
      );
      return newChatState;
    });
  };

  const currentChatState = (): ChatState => {
    return chatState.get(currentSessionId()) || "input";
  };

  const currentChatAnswering = () => {
    return (
      currentChatState() == "toolBuilding" ||
      currentChatState() == "streaming" ||
      currentChatState() == "loading"
    );
  };

  const updateRegenerationState = (
    newState: RegenerationState | null,
    sessionId?: string | null
  ) => {
    const newRegenerationState = new Map(regenerationState);
    newRegenerationState.set(
      sessionId !== undefined && sessionId != null
        ? sessionId
        : currentSessionId(),
      newState
    );

    setRegenerationState((prevState) => {
      const newRegenerationState = new Map(prevState);
      newRegenerationState.set(
        sessionId !== undefined && sessionId != null
          ? sessionId
          : currentSessionId(),
        newState
      );
      return newRegenerationState;
    });
  };

  const resetRegenerationState = (sessionId?: string | null) => {
    updateRegenerationState(null, sessionId);
  };

  const currentRegenerationState = (): RegenerationState | null => {
    return regenerationState.get(currentSessionId()) || null;
  };

  const [canContinue, setCanContinue] = useState<Map<string | null, boolean>>(
    new Map([[null, false]])
  );

  const updateCanContinue = (newState: boolean, sessionId?: string | null) => {
    setCanContinue((prevState) => {
      const newCanContinueState = new Map(prevState);
      newCanContinueState.set(
        sessionId !== undefined ? sessionId : currentSessionId(),
        newState
      );
      return newCanContinueState;
    });
  };

  const currentCanContinue = (): boolean => {
    return canContinue.get(currentSessionId()) || false;
  };

  const currentSessionChatState = currentChatState();
  const currentSessionRegenerationState = currentRegenerationState();

  // for document display
  // NOTE: -1 is a special designation that means the latest AI message
  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] =
    useState<number | null>(null);

  const { aiMessage, humanMessage } = selectedMessageForDocDisplay
    ? getHumanAndAIMessageFromMessageNumber(
        messageHistory,
        selectedMessageForDocDisplay
      )
    : { aiMessage: null, humanMessage: null };

  const [chatSessionSharedStatus, setChatSessionSharedStatus] =
    useState<ChatSessionSharedStatus>(ChatSessionSharedStatus.Private);

  useEffect(() => {
    if (messageHistory.length === 0 && chatSessionIdRef.current === null) {
      // Select from available assistants so shared assistants appear.
      setSelectedAssistant(
        availableAssistants.find((persona) => persona.id === defaultAssistantId)
      );
    }
  }, [defaultAssistantId, availableAssistants, messageHistory.length]);

  useEffect(() => {
    if (
      submittedMessage &&
      currentSessionChatState === "loading" &&
      messageHistory.length == 0
    ) {
      window.parent.postMessage(
        { type: CHROME_MESSAGE.LOAD_NEW_CHAT_PAGE },
        "*"
      );
    }
  }, [submittedMessage, currentSessionChatState]);
  // just choose a conservative default, this will be updated in the
  // background on initial load / on persona change
  const [maxTokens, setMaxTokens] = useState<number>(4096);

  // fetch # of allowed document tokens for the selected Persona
  useEffect(() => {
    async function fetchMaxTokens() {
      const response = await fetch(
        `/api/chat/max-selected-document-tokens?persona_id=${liveAssistant?.id}`
      );
      if (response.ok) {
        const maxTokens = (await response.json()).max_tokens as number;
        setMaxTokens(maxTokens);
      }
    }
    fetchMaxTokens();
  }, [liveAssistant]);

  const filterManager = useFilters();
  const [isChatSearchModalOpen, setIsChatSearchModalOpen] = useState(false);

  const [currentFeedback, setCurrentFeedback] = useState<
    [FeedbackType, number] | null
  >(null);

  const [sharingModalVisible, setSharingModalVisible] =
    useState<boolean>(false);

  const [aboveHorizon, setAboveHorizon] = useState(false);

  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const endPaddingRef = useRef<HTMLDivElement>(null);

  const previousHeight = useRef<number>(
    inputRef.current?.getBoundingClientRect().height!
  );
  const scrollDist = useRef<number>(0);

  const handleInputResize = () => {
    setTimeout(() => {
      if (
        inputRef.current &&
        lastMessageRef.current &&
        !waitForScrollRef.current
      ) {
        const newHeight: number =
          inputRef.current?.getBoundingClientRect().height!;
        const heightDifference = newHeight - previousHeight.current;
        if (
          previousHeight.current &&
          heightDifference != 0 &&
          endPaddingRef.current &&
          scrollableDivRef &&
          scrollableDivRef.current
        ) {
          endPaddingRef.current.style.transition = "height 0.3s ease-out";
          endPaddingRef.current.style.height = `${Math.max(
            newHeight - 50,
            0
          )}px`;

          if (AUTO_SCROLL_ENABLED) {
            scrollableDivRef?.current.scrollBy({
              left: 0,
              top: Math.max(heightDifference, 0),
              behavior: "smooth",
            });
          }
        }
        previousHeight.current = newHeight;
      }
    }, 100);
  };

  const clientScrollToBottom = (fast?: boolean) => {
    if (!endDivRef.current || !scrollableDivRef.current) {
      console.error("endDivRef or scrollableDivRef not found");
      return;
    }

    scrollableDivRef.current.scrollTo({
      top: scrollableDivRef.current.scrollHeight,
      behavior: fast ? "auto" : "smooth"
    });
  };

  return (
    <div>Chat interface here</div>
  );
}
