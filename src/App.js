import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  CreditCard,
  Download,
  FileText,
  FolderOpen,
  Plus,
  RefreshCw,
  Save,
  Send,
  Smartphone,
  Trash2,
  UserPlus
} from 'lucide-react';

const STORAGE_KEY = 'invoice-system-mvp-v1';
const DOCUMENT_TYPES = ['quotation', 'invoice', 'receipt', 'letter'];
const STATUS_BY_TYPE = {
  quotation: 'draft',
  invoice: 'draft',
  receipt: 'paid',
  letter: 'draft'
};
const STATUS_OPTIONS = ['draft', 'sent', 'paid', 'overdue'];

const DEFAULT_COMPANY_INFO = {
  name: '',
  tagline: '',
  phone: '',
  email: '',
  website: '',
  address: ''
};

const DEFAULT_CLIENT_INFO = {
  name: '',
  phone: '',
  email: '',
  company: ''
};

const DEFAULT_ADDITIONAL_COSTS = {
  tax: 18,
  companyShare: 0
};

const DEFAULT_PAYMENT_DETAILS = {
  bankName: '',
  accountName: '',
  accountDetails: '',
  accountNumber: '',
  bankCode: '',
  branchCode: '',
  branchName: '',
  streetNameOfBank: '',
  swiftCode: '',
  mobileMoney: '',
  mobileMoneyName: '',
  mobileProvider: 'MTN MoMo'
};

const DEFAULT_POLICIES = {
  payment: 'Payment is due as stated on the invoice unless otherwise agreed in writing.',
  cancellation: 'Cancellation terms can be adjusted for each client before sending the document.',
  rate: 'Rates may change based on taxes, availability, or exchange-rate movement.'
};

const DEFAULT_LETTER_CONTENT = {
  subject: '',
  body: '',
  closing: 'Sincerely,\n\nBusiness Team'
};

const createEmptyLineItem = () => ({
  description: '',
  price: 0,
  qty: 1,
  unit: 'service'
});

const getToday = () => new Date().toISOString().split('T')[0];

const addDays = (dateValue, daysToAdd) => {
  const nextDate = new Date(dateValue);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate.toISOString().split('T')[0];
};

const formatHumanDate = (dateValue) => {
  if (!dateValue) {
    return 'Not set';
  }

  return new Date(dateValue).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const safeRate = (rate) => (rate > 0 ? rate : 1);

const calculateTotals = (lineItems, additionalCosts) => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
  const taxAmount = subtotal * ((additionalCosts.tax || 0) / 100);
  const companyShareAmount = (subtotal + taxAmount) * ((additionalCosts.companyShare || 0) / 100);
  const total = subtotal + taxAmount + companyShareAmount;
  return { subtotal, taxAmount, companyShareAmount, total };
};

const formatMoney = (ugxAmount, currency, exchangeRate) => {
  if (currency === 'USD') {
    return `$${(ugxAmount / safeRate(exchangeRate)).toFixed(2)}`;
  }

  return `UGX ${Math.round(ugxAmount || 0).toLocaleString()}`;
};

const getNextDocumentNumber = (documents) => {
  const highest = documents.reduce((maxValue, document) => {
    const parsed = parseInt(String(document?.documentDetails?.number || '').replace(/\D/g, ''), 10);
    return Number.isFinite(parsed) && parsed > maxValue ? parsed : maxValue;
  }, 0);

  return String(highest + 1).padStart(3, '0');
};

const loadStoredState = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
};

const saveStoredState = (state) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Ignore storage failures in the MVP. The UI still works in-session.
  }
};

const buildShareMessage = (documentType, documentDetails, clientInfo, companyInfo, totals, currency, exchangeRate, paymentDetails) => {
  const lines = [
    `Hello ${clientInfo.name || 'there'},`,
    `Please find your ${documentType} ${documentDetails.number ? `#${documentDetails.number}` : ''} from ${companyInfo.name || 'our team'}.`
  ];

  if (documentType !== 'letter') {
    lines.push(`Amount: ${formatMoney(totals.total, currency, exchangeRate)}.`);

    if (documentDetails.dueDate && documentType !== 'receipt') {
      lines.push(`Due date: ${formatHumanDate(documentDetails.dueDate)}.`);
    }

    if (paymentDetails.mobileMoney) {
      lines.push(`Mobile money: ${paymentDetails.mobileProvider || 'MoMo'} ${paymentDetails.mobileMoney}.`);
    }

    if (paymentDetails.accountName || paymentDetails.bankName) {
      lines.push(
        `Bank: ${paymentDetails.accountName || 'Account'}${paymentDetails.bankName ? `, ${paymentDetails.bankName}` : ''}${
          paymentDetails.accountNumber ? `, ${paymentDetails.accountNumber}` : ''
        }.`
      );
    }
  }

  lines.push('Thank you.');
  return lines.join(' ');
};

const statusStyles = {
  draft: 'bg-stone-100 text-stone-700 border-stone-200',
  sent: 'bg-amber-100 text-amber-800 border-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  overdue: 'bg-rose-100 text-rose-800 border-rose-200'
};

const App = () => {
  const [storedState] = useState(() => loadStoredState());
  const initialDocuments = storedState.savedDocuments || [];
  const initialDraft = storedState.draft || {};
  const initialNumber = initialDraft.documentDetails?.number || getNextDocumentNumber(initialDocuments);
  const initialIssueDate = initialDraft.documentDetails?.issueDate || getToday();

  const [savedClients, setSavedClients] = useState(storedState.savedClients || []);
  const [savedDocuments, setSavedDocuments] = useState(initialDocuments);
  const [currentDocumentId, setCurrentDocumentId] = useState(initialDraft.currentDocumentId || null);
  const [documentType, setDocumentType] = useState(initialDraft.documentType || 'quotation');
  const [workflowStatus, setWorkflowStatus] = useState(initialDraft.workflowStatus || STATUS_BY_TYPE[initialDraft.documentType || 'quotation']);
  const [currency, setCurrency] = useState(initialDraft.currency || 'UGX');
  const [exchangeRate, setExchangeRate] = useState(initialDraft.exchangeRate || 3700);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState('');
  const [rateLastUpdated, setRateLastUpdated] = useState(initialDraft.rateLastUpdated || '');
  const [companyInfo, setCompanyInfo] = useState(initialDraft.companyInfo || DEFAULT_COMPANY_INFO);
  const [clientInfo, setClientInfo] = useState(initialDraft.clientInfo || DEFAULT_CLIENT_INFO);
  const [documentDetails, setDocumentDetails] = useState(
    initialDraft.documentDetails || {
      number: initialNumber,
      issueDate: initialIssueDate,
      dueDate: addDays(initialIssueDate, 7)
    }
  );
  const [lineItems, setLineItems] = useState(initialDraft.lineItems || [createEmptyLineItem()]);
  const [additionalCosts, setAdditionalCosts] = useState(initialDraft.additionalCosts || DEFAULT_ADDITIONAL_COSTS);
  const [paymentDetails, setPaymentDetails] = useState(initialDraft.paymentDetails || DEFAULT_PAYMENT_DETAILS);
  const [policies, setPolicies] = useState(initialDraft.policies || DEFAULT_POLICIES);
  const [letterContent, setLetterContent] = useState(initialDraft.letterContent || DEFAULT_LETTER_CONTENT);
  const [activityMessage, setActivityMessage] = useState('');

  const totals = calculateTotals(lineItems, additionalCosts);
  const isLetter = documentType === 'letter';
  const readySteps = [
    { label: 'Business identity', done: Boolean(companyInfo.name && companyInfo.email) },
    { label: 'Customer contact flow', done: Boolean(companyInfo.phone || companyInfo.email) },
    { label: 'Payment setup', done: Boolean(paymentDetails.mobileMoney || paymentDetails.accountName) },
    { label: 'Default terms', done: Boolean(policies.payment && policies.rate) }
  ];
  const setupProgress = readySteps.filter((item) => item.done).length;

  const dashboardMetrics = {
    documents: savedDocuments.length,
    openPipeline: savedDocuments.filter((item) => !['receipt', 'letter'].includes(item.documentType) && item.workflowStatus !== 'paid').length,
    paidRevenue: savedDocuments
      .filter((item) => item.documentType !== 'letter' && item.workflowStatus === 'paid')
      .reduce((sum, item) => sum + (item.totals?.total || 0), 0)
  };

  useEffect(() => {
    saveStoredState({
      savedClients,
      savedDocuments,
      draft: {
        currentDocumentId,
        documentType,
        workflowStatus,
        currency,
        exchangeRate,
        rateLastUpdated,
        companyInfo,
        clientInfo,
        documentDetails,
        lineItems,
        additionalCosts,
        paymentDetails,
        policies,
        letterContent
      }
    });
  }, [
    additionalCosts,
    clientInfo,
    companyInfo,
    currentDocumentId,
    currency,
    documentDetails,
    documentType,
    exchangeRate,
    letterContent,
    lineItems,
    paymentDetails,
    policies,
    rateLastUpdated,
    savedClients,
    savedDocuments,
    workflowStatus
  ]);

  useEffect(() => {
    if (!activityMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => setActivityMessage(''), 3000);
    return () => window.clearTimeout(timer);
  }, [activityMessage]);

  useEffect(() => {
    if (typeof fetch !== 'function') {
      return;
    }

    const fetchExchangeRate = async () => {
      setRateLoading(true);
      setRateError('');

      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();

        if (data?.rates?.UGX) {
          setExchangeRate(Math.round(data.rates.UGX));
          setRateLastUpdated(new Date().toLocaleTimeString());
        } else {
          throw new Error('Invalid response');
        }
      } catch (error) {
        setRateError('Could not fetch a live rate. You can still edit the rate manually.');
      } finally {
        setRateLoading(false);
      }
    };

    fetchExchangeRate();
  }, []);

  const buildCurrentDocument = (overrides = {}) => ({
    id: overrides.id || currentDocumentId || `doc-${Date.now()}`,
    documentType: overrides.documentType || documentType,
    workflowStatus: overrides.workflowStatus || workflowStatus,
    currency: overrides.currency || currency,
    exchangeRate: overrides.exchangeRate || exchangeRate,
    rateLastUpdated: rateLastUpdated || '',
    companyInfo: { ...companyInfo },
    clientInfo: { ...clientInfo },
    documentDetails: { ...documentDetails },
    lineItems: lineItems.map((item) => ({ ...item })),
    additionalCosts: { ...additionalCosts },
    paymentDetails: { ...paymentDetails },
    policies: { ...policies },
    letterContent: { ...letterContent },
    totals: calculateTotals(lineItems, additionalCosts),
    updatedAt: new Date().toISOString()
  });

  const resetDocument = (nextType = 'quotation', nextDocuments = savedDocuments) => {
    const freshIssueDate = getToday();

    setCurrentDocumentId(null);
    setDocumentType(nextType);
    setWorkflowStatus(STATUS_BY_TYPE[nextType]);
    setClientInfo(DEFAULT_CLIENT_INFO);
    setDocumentDetails({
      number: getNextDocumentNumber(nextDocuments),
      issueDate: freshIssueDate,
      dueDate: addDays(freshIssueDate, 7)
    });
    setLineItems([createEmptyLineItem()]);
    setLetterContent(DEFAULT_LETTER_CONTENT);
    setActivityMessage(`Started a new ${nextType}.`);
  };

  const saveClient = () => {
    if (!clientInfo.name.trim()) {
      setActivityMessage('Add a client name first.');
      return;
    }

    const newClient = {
      id: clientInfo.email?.trim().toLowerCase() || `client-${Date.now()}`,
      ...clientInfo,
      updatedAt: new Date().toISOString()
    };

    setSavedClients((currentClients) => {
      const alreadyExists = currentClients.some((item) => item.id === newClient.id);

      if (alreadyExists) {
        return currentClients.map((item) => (item.id === newClient.id ? newClient : item));
      }

      return [newClient, ...currentClients];
    });

    setActivityMessage('Client saved for reuse.');
  };

  const removeClient = (clientId) => {
    setSavedClients((currentClients) => currentClients.filter((item) => item.id !== clientId));
    setActivityMessage('Saved client removed.');
  };

  const loadDocument = (documentRecord) => {
    setCurrentDocumentId(documentRecord.id);
    setDocumentType(documentRecord.documentType);
    setWorkflowStatus(documentRecord.workflowStatus || STATUS_BY_TYPE[documentRecord.documentType]);
    setCurrency(documentRecord.currency || 'UGX');
    setExchangeRate(documentRecord.exchangeRate || 3700);
    setRateLastUpdated(documentRecord.rateLastUpdated || '');
    setCompanyInfo(documentRecord.companyInfo || DEFAULT_COMPANY_INFO);
    setClientInfo(documentRecord.clientInfo || DEFAULT_CLIENT_INFO);
    setDocumentDetails(documentRecord.documentDetails);
    setLineItems(documentRecord.lineItems?.length ? documentRecord.lineItems : [createEmptyLineItem()]);
    setAdditionalCosts(documentRecord.additionalCosts || DEFAULT_ADDITIONAL_COSTS);
    setPaymentDetails(documentRecord.paymentDetails || DEFAULT_PAYMENT_DETAILS);
    setPolicies(documentRecord.policies || DEFAULT_POLICIES);
    setLetterContent(documentRecord.letterContent || DEFAULT_LETTER_CONTENT);
    setActivityMessage(`${documentRecord.documentType} #${documentRecord.documentDetails?.number || ''} loaded.`);
  };

  const persistDocument = (documentRecord) => {
    const existing = savedDocuments.find((item) => item.id === documentRecord.id);
    const nextRecord = existing
      ? { ...existing, ...documentRecord, updatedAt: new Date().toISOString() }
      : { ...documentRecord, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const nextDocuments = existing
      ? savedDocuments.map((item) => (item.id === nextRecord.id ? nextRecord : item))
      : [nextRecord, ...savedDocuments];

    setSavedDocuments(nextDocuments);
    return { nextDocuments, nextRecord };
  };

  const saveCurrentDocument = (statusOverride = workflowStatus) => {
    const documentRecord = buildCurrentDocument({ workflowStatus: statusOverride });
    const { nextDocuments, nextRecord } = persistDocument(documentRecord);

    setCurrentDocumentId(nextRecord.id);
    setWorkflowStatus(statusOverride);

    if (clientInfo.name.trim()) {
      saveClient();
    }

    setActivityMessage(`${nextRecord.documentType} saved.`);
    return { nextDocuments, nextRecord };
  };

  const createFollowOnDocument = (nextType) => {
    const { nextDocuments, nextRecord } = saveCurrentDocument();
    const issueDate = getToday();
    const followOnRecord = {
      ...nextRecord,
      id: `doc-${Date.now()}`,
      documentType: nextType,
      workflowStatus: STATUS_BY_TYPE[nextType],
      documentDetails: {
        ...nextRecord.documentDetails,
        number: getNextDocumentNumber(nextDocuments),
        issueDate,
        dueDate: nextType === 'receipt' ? issueDate : addDays(issueDate, 7)
      },
      updatedAt: new Date().toISOString()
    };

    const result = persistDocument(followOnRecord);
    loadDocument(result.nextRecord);
    setActivityMessage(`${nextType} created from the current ${documentType}.`);
  };

  const deleteDocument = (documentId) => {
    const nextDocuments = savedDocuments.filter((item) => item.id !== documentId);
    setSavedDocuments(nextDocuments);

    if (currentDocumentId === documentId) {
      resetDocument('quotation', nextDocuments);
    } else {
      setActivityMessage('Saved document removed.');
    }
  };

  const copyShareText = async () => {
    if (!navigator.clipboard) {
      setActivityMessage('Clipboard access is not available in this browser.');
      return;
    }

    try {
      await navigator.clipboard.writeText(
        buildShareMessage(documentType, documentDetails, clientInfo, companyInfo, totals, currency, exchangeRate, paymentDetails)
      );
      setActivityMessage('Share message copied.');
    } catch (error) {
      setActivityMessage('Could not copy the share message.');
    }
  };

  const refreshExchangeRate = async () => {
    if (typeof fetch !== 'function') {
      return;
    }

    setRateLoading(true);
    setRateError('');

    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();

      if (data?.rates?.UGX) {
        setExchangeRate(Math.round(data.rates.UGX));
        setRateLastUpdated(new Date().toLocaleTimeString());
        setActivityMessage('Exchange rate updated.');
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      setRateError('Could not fetch a live rate. You can still edit the rate manually.');
    } finally {
      setRateLoading(false);
    }
  };

  const updateLineItem = (index, field, value) => {
    const nextItems = [...lineItems];

    if (field === 'price') {
      const parsedValue = parseFloat(value) || 0;
      nextItems[index][field] = currency === 'USD' ? parsedValue * safeRate(exchangeRate) : parsedValue;
    } else if (field === 'qty') {
      nextItems[index][field] = parseFloat(value) || 0;
    } else {
      nextItems[index][field] = value;
    }

    setLineItems(nextItems);
  };

  const getEditablePrice = (priceValue) => {
    if (!priceValue) {
      return '';
    }

    return currency === 'USD' ? (priceValue / safeRate(exchangeRate)).toFixed(2) : String(priceValue);
  };

  const inputClass =
    'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 transition-all focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100';
  const smallButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50';
  const metricCardClass = 'rounded-2xl border border-stone-200 bg-white p-4 shadow-sm';
  const availableStatuses = isLetter ? ['draft', 'sent'] : STATUS_OPTIONS;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7_0%,_#fffbeb_28%,_#f5f5f4_70%)] text-stone-900">
      <div className="print:hidden border-b border-stone-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900 text-white shadow-lg shadow-emerald-900/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Local-first MVP</p>
              <h1 className="text-xl font-bold tracking-tight text-stone-900">Quote-to-payment workflow</h1>
              <p className="text-sm text-stone-600">
                Create documents, reuse customer data, and move from quotation to receipt without leaving one screen.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => resetDocument('quotation')} className={smallButtonClass}>
              <Plus className="h-4 w-4" />
              New quote
            </button>
            <button onClick={() => saveCurrentDocument()} className={`${smallButtonClass} border-emerald-200 bg-emerald-50 text-emerald-800`}>
              <Save className="h-4 w-4" />
              Save
            </button>
            <button onClick={copyShareText} className={smallButtonClass}>
              <Copy className="h-4 w-4" />
              Copy share text
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activityMessage && (
          <div className="print:hidden mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            {activityMessage}
          </div>
        )}

        <div className="print:hidden mb-6 grid gap-4 md:grid-cols-3">
          <div className={metricCardClass}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Saved documents</p>
            <p className="mt-2 text-3xl font-bold text-stone-900">{dashboardMetrics.documents}</p>
            <p className="mt-1 text-sm text-stone-600">Local history you can reopen anytime.</p>
          </div>
          <div className={metricCardClass}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Open pipeline</p>
            <p className="mt-2 text-3xl font-bold text-stone-900">{dashboardMetrics.openPipeline}</p>
            <p className="mt-1 text-sm text-stone-600">Quotations and invoices not yet marked paid.</p>
          </div>
          <div className={metricCardClass}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Paid value</p>
            <p className="mt-2 text-3xl font-bold text-stone-900">{formatMoney(dashboardMetrics.paidRevenue, 'UGX', exchangeRate)}</p>
            <p className="mt-1 text-sm text-stone-600">Running total from documents marked paid.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="print:hidden space-y-5 lg:col-span-2">
            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">MVP readiness</p>
                  <h2 className="mt-1 text-lg font-bold text-stone-900">Business setup</h2>
                </div>
                <div className="rounded-2xl bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700">
                  {setupProgress}/{readySteps.length} ready
                </div>
              </div>
              <p className="mt-2 text-sm text-stone-600">
                This MVP stores data on this device so you can test the workflow before adding accounts and sync.
              </p>
              <div className="mt-4 space-y-2">
                {readySteps.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
                    <span className="font-medium text-stone-700">{item.label}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.done ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                      {item.done ? 'Ready' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Workflow</p>
                  <h2 className="mt-1 text-lg font-bold text-stone-900">Current document</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusStyles[workflowStatus]}`}>
                  {workflowStatus}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {DOCUMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setDocumentType(type);
                      setWorkflowStatus(STATUS_BY_TYPE[type]);
                    }}
                    className={`rounded-2xl px-3 py-2 text-sm font-semibold transition-all ${
                      documentType === type ? 'bg-emerald-800 text-white shadow-md' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {availableStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setWorkflowStatus(status)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                      workflowStatus === status ? statusStyles[status] : 'border-stone-200 bg-white text-stone-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button onClick={() => saveCurrentDocument()} className={`${smallButtonClass} justify-center`}>
                  <Save className="h-4 w-4" />
                  Save document
                </button>
                {!isLetter && documentType === 'quotation' && (
                  <button onClick={() => createFollowOnDocument('invoice')} className={`${smallButtonClass} justify-center`}>
                    <Send className="h-4 w-4" />
                    Create invoice
                  </button>
                )}
                {!isLetter && documentType === 'invoice' && (
                  <button onClick={() => createFollowOnDocument('receipt')} className={`${smallButtonClass} justify-center`}>
                    <ClipboardCheck className="h-4 w-4" />
                    Create receipt
                  </button>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Business profile</p>
              <h2 className="mt-1 text-lg font-bold text-stone-900">Plug-and-play setup</h2>
              <div className="mt-4 space-y-3">
                {[
                  ['name', 'Business name'],
                  ['tagline', 'Tagline'],
                  ['phone', 'Phone number'],
                  ['email', 'Email address'],
                  ['website', 'Website or social link'],
                  ['address', 'Business address']
                ].map(([field, label]) => (
                  <input
                    key={field}
                    type="text"
                    placeholder={label}
                    value={companyInfo[field]}
                    onChange={(event) => setCompanyInfo({ ...companyInfo, [field]: event.target.value })}
                    className={inputClass}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Client</p>
                  <h2 className="mt-1 text-lg font-bold text-stone-900">Customer details</h2>
                </div>
                <button onClick={saveClient} className={smallButtonClass}>
                  <UserPlus className="h-4 w-4" />
                  Save client
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  ['name', 'Client name'],
                  ['company', 'Client company'],
                  ['phone', 'Client phone'],
                  ['email', 'Client email']
                ].map(([field, label]) => (
                  <input
                    key={field}
                    type="text"
                    placeholder={label}
                    value={clientInfo[field]}
                    onChange={(event) => setClientInfo({ ...clientInfo, [field]: event.target.value })}
                    className={inputClass}
                  />
                ))}
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Saved clients</p>
                <div className="mt-2 max-h-48 space-y-2 overflow-auto pr-1">
                  {savedClients.length === 0 && <p className="text-sm text-stone-500">No saved clients yet.</p>}
                  {savedClients.map((client) => (
                    <div key={client.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          onClick={() => {
                            setClientInfo({
                              name: client.name || '',
                              company: client.company || '',
                              phone: client.phone || '',
                              email: client.email || ''
                            });
                            setActivityMessage(`${client.name} loaded into the document.`);
                          }}
                          className="text-left"
                        >
                          <p className="font-semibold text-stone-800">{client.name}</p>
                          <p className="text-sm text-stone-500">{client.company || client.email || client.phone || 'No extra details'}</p>
                        </button>
                        <button onClick={() => removeClient(client.id)} className="rounded-full p-2 text-stone-400 transition-all hover:bg-white hover:text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Document details</p>
              <h2 className="mt-1 text-lg font-bold text-stone-900">Dates and pricing</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Document number"
                  value={documentDetails.number}
                  onChange={(event) => setDocumentDetails({ ...documentDetails, number: event.target.value })}
                  className={inputClass}
                />
                <select value={currency} onChange={(event) => setCurrency(event.target.value)} className={inputClass}>
                  <option value="UGX">UGX output</option>
                  <option value="USD">USD output</option>
                </select>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Issue date</label>
                  <input
                    type="date"
                    value={documentDetails.issueDate}
                    onChange={(event) => setDocumentDetails({ ...documentDetails, issueDate: event.target.value })}
                    className={inputClass}
                  />
                </div>
                {!isLetter && (
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Due date</label>
                    <input
                      type="date"
                      value={documentDetails.dueDate}
                      onChange={(event) => setDocumentDetails({ ...documentDetails, dueDate: event.target.value })}
                      className={inputClass}
                    />
                  </div>
                )}
              </div>

              {!isLetter && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">USD / UGX rate</p>
                      <p className="text-sm text-emerald-700">Unit prices are stored in UGX and displayed in the selected output currency.</p>
                    </div>
                    <button onClick={refreshExchangeRate} disabled={rateLoading} className="text-sm font-semibold text-emerald-800 disabled:opacity-50">
                      <RefreshCw className={`h-4 w-4 ${rateLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="number"
                      value={exchangeRate}
                      onChange={(event) => setExchangeRate(parseFloat(event.target.value) || 0)}
                      className="w-32 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-bold text-emerald-900 focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="text-sm text-emerald-800">UGX per 1 USD</span>
                  </div>
                  {rateLastUpdated && <p className="mt-2 text-xs text-emerald-700">Last updated at {rateLastUpdated}</p>}
                  {rateError && <p className="mt-2 text-xs text-rose-600">{rateError}</p>}
                </div>
              )}
            </section>

            {isLetter ? (
              <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Letter content</p>
                <h2 className="mt-1 text-lg font-bold text-stone-900">Message</h2>
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={letterContent.subject}
                    onChange={(event) => setLetterContent({ ...letterContent, subject: event.target.value })}
                    className={inputClass}
                  />
                  <textarea
                    rows={8}
                    placeholder="Letter body"
                    value={letterContent.body}
                    onChange={(event) => setLetterContent({ ...letterContent, body: event.target.value })}
                    className={inputClass}
                  />
                  <textarea
                    rows={4}
                    placeholder="Closing"
                    value={letterContent.closing}
                    onChange={(event) => setLetterContent({ ...letterContent, closing: event.target.value })}
                    className={inputClass}
                  />
                </div>
              </section>
            ) : (
              <>
                <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Services</p>
                      <h2 className="mt-1 text-lg font-bold text-stone-900">Line items</h2>
                    </div>
                    <button onClick={() => setLineItems([...lineItems, createEmptyLineItem()])} className={smallButtonClass}>
                      <Plus className="h-4 w-4" />
                      Add item
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {lineItems.map((item, index) => (
                      <div key={`${item.description}-${index}`} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(event) => updateLineItem(index, 'description', event.target.value)}
                          className={inputClass}
                        />
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder={currency === 'USD' ? 'Unit price (USD)' : 'Unit price (UGX)'}
                            value={getEditablePrice(item.price)}
                            onChange={(event) => updateLineItem(index, 'price', event.target.value)}
                            className={inputClass}
                          />
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.qty}
                            onChange={(event) => updateLineItem(index, 'qty', event.target.value)}
                            className={inputClass}
                          />
                          <input
                            type="text"
                            placeholder="Unit"
                            value={item.unit}
                            onChange={(event) => updateLineItem(index, 'unit', event.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="font-medium text-stone-600">Line total</span>
                          <span className="font-bold text-stone-900">{formatMoney(item.price * item.qty, currency, exchangeRate)}</span>
                        </div>
                        {lineItems.length > 1 && (
                          <button
                            onClick={() => setLineItems(lineItems.filter((_, itemIndex) => itemIndex !== index))}
                            className="mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition-all hover:bg-white"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Pricing rules</p>
                  <h2 className="mt-1 text-lg font-bold text-stone-900">Taxes and markup</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Tax %</label>
                      <input
                        type="number"
                        value={additionalCosts.tax}
                        onChange={(event) => setAdditionalCosts({ ...additionalCosts, tax: parseFloat(event.target.value) || 0 })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Company share %</label>
                      <input
                        type="number"
                        value={additionalCosts.companyShare}
                        onChange={(event) => setAdditionalCosts({ ...additionalCosts, companyShare: parseFloat(event.target.value) || 0 })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Payment setup</p>
                  <h2 className="mt-1 text-lg font-bold text-stone-900">Bank and mobile money</h2>

                  <div className="mt-4 space-y-3">
                    {[
                      ['accountName', 'Account name'],
                      ['accountNumber', 'Account number'],
                      ['accountDetails', 'Account details'],
                      ['bankName', 'Bank name'],
                      ['branchName', 'Branch name'],
                      ['swiftCode', 'SWIFT / BIC'],
                      ['mobileProvider', 'Mobile money provider'],
                      ['mobileMoney', 'Mobile money number'],
                      ['mobileMoneyName', 'Mobile money registered name']
                    ].map(([field, label]) => (
                      <input
                        key={field}
                        type="text"
                        placeholder={label}
                        value={paymentDetails[field]}
                        onChange={(event) => setPaymentDetails({ ...paymentDetails, [field]: event.target.value })}
                        className={inputClass}
                      />
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Default terms</p>
                  <h2 className="mt-1 text-lg font-bold text-stone-900">Policies</h2>
                  <div className="mt-4 space-y-3">
                    {[
                      ['payment', 'Payment policy'],
                      ['cancellation', 'Cancellation policy'],
                      ['rate', 'Rate policy']
                    ].map(([field, label]) => (
                      <textarea
                        key={field}
                        rows={3}
                        placeholder={label}
                        value={policies[field]}
                        onChange={(event) => setPolicies({ ...policies, [field]: event.target.value })}
                        className={inputClass}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}

            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Document history</p>
                  <h2 className="mt-1 text-lg font-bold text-stone-900">Saved records</h2>
                </div>
                <FolderOpen className="h-5 w-5 text-stone-400" />
              </div>

              <div className="mt-4 max-h-96 space-y-3 overflow-auto pr-1">
                {savedDocuments.length === 0 && <p className="text-sm text-stone-500">Save a document to start your local history.</p>}
                {savedDocuments.map((documentRecord) => (
                  <div key={documentRecord.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <button onClick={() => loadDocument(documentRecord)} className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-stone-900">
                            {documentRecord.documentType} #{documentRecord.documentDetails?.number || '-'}
                          </p>
                          <span className={`rounded-full border px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyles[documentRecord.workflowStatus] || statusStyles.draft}`}>
                            {documentRecord.workflowStatus}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-stone-500">
                          {documentRecord.clientInfo?.name || 'No client'}
                          {documentRecord.documentType !== 'letter'
                            ? ` - ${formatMoney(documentRecord.totals?.total || 0, documentRecord.currency, documentRecord.exchangeRate)}`
                            : ''}
                        </p>
                        <p className="mt-1 text-xs text-stone-400">Updated {formatHumanDate(documentRecord.updatedAt || documentRecord.createdAt)}</p>
                      </button>
                      <button onClick={() => deleteDocument(documentRecord.id)} className="rounded-full p-2 text-stone-400 transition-all hover:bg-white hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-2xl shadow-stone-200/70 print:rounded-none print:border-0 print:shadow-none">
              {isLetter ? (
                <div className="p-8 sm:p-12 print:p-8">
                  <div className="border-b-4 border-amber-400 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Business letter</p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">{companyInfo.name || 'Your business name'}</h2>
                        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{companyInfo.tagline || 'Add your tagline in setup'}</p>
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-900 text-white">
                        <Building2 className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-1 text-sm text-stone-600">
                      <p>{companyInfo.address || 'Business address goes here'}</p>
                      <p>{companyInfo.phone || 'Phone number'}</p>
                      <p>{companyInfo.email || 'Email address'}</p>
                      <p>{companyInfo.website || 'Website or social link'}</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-sm font-semibold text-stone-600">{formatHumanDate(documentDetails.issueDate)}</p>
                  </div>

                  <div className="mt-10">
                    <p className="text-lg font-bold text-stone-900">{clientInfo.name || 'Client name'}</p>
                    <p className="mt-1 text-sm text-stone-600">{clientInfo.company || 'Client company'}</p>
                    <p className="text-sm text-stone-600">{clientInfo.email || 'Client email'}</p>
                    <p className="text-sm text-stone-600">{clientInfo.phone || 'Client phone'}</p>
                  </div>

                  <div className="mt-10 border-b border-stone-200 pb-4">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-500">Subject</p>
                    <p className="mt-2 text-lg font-semibold text-stone-900">{letterContent.subject || 'Enter your subject'}</p>
                  </div>

                  <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-stone-700">{letterContent.body || 'Write your message here.'}</div>
                  <div className="mt-10 whitespace-pre-wrap text-base leading-8 text-stone-700">{letterContent.closing}</div>
                </div>
              ) : (
                <div>
                  <div className="bg-[linear-gradient(135deg,_#052e16_0%,_#166534_45%,_#0f766e_100%)] px-6 py-6 text-white sm:px-8 sm:py-8 print:px-6 print:py-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-1 items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15">
                          <Building2 className="h-7 w-7 text-amber-300" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">Document workflow</p>
                          <h2 className="mt-1 text-2xl font-bold tracking-tight">{companyInfo.name || 'Your business name'}</h2>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">{companyInfo.tagline || 'Add your tagline in setup'}</p>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-emerald-50">
                            <span>{companyInfo.phone || 'Phone number'}</span>
                            <span>{companyInfo.email || 'Email address'}</span>
                            <span>{companyInfo.website || 'Website or social link'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="min-w-[220px] rounded-3xl border border-white/15 bg-black/15 p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">{documentType}</p>
                          <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyles[workflowStatus]}`}>
                            {workflowStatus}
                          </span>
                        </div>
                        <p className="mt-3 text-2xl font-bold">#{documentDetails.number || '000'}</p>
                        <div className="mt-3 text-sm text-emerald-50">
                          <p>Issued: {formatHumanDate(documentDetails.issueDate)}</p>
                          <p>Due: {formatHumanDate(documentDetails.dueDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 p-6 sm:p-8 print:grid-cols-[1.8fr_1fr] print:gap-4 print:p-6">
                    <div>
                      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Bill to</p>
                        <p className="mt-2 text-lg font-bold text-stone-900">{clientInfo.name || 'Client name'}</p>
                        <p className="mt-1 text-sm text-stone-600">{clientInfo.company || 'Client company'}</p>
                        <p className="text-sm text-stone-600">{clientInfo.phone || 'Client phone'}</p>
                        <p className="text-sm text-stone-600">{clientInfo.email || 'Client email'}</p>
                      </div>

                      <div className="mt-6 overflow-hidden rounded-3xl border border-stone-200">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-stone-100">
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Description</th>
                              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Unit price</th>
                              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Qty</th>
                              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lineItems.map((item, index) => (
                              <tr key={`${item.description}-preview-${index}`} className="border-t border-stone-100">
                                <td className="px-4 py-3 text-sm font-medium text-stone-800">{item.description || '-'}</td>
                                <td className="px-4 py-3 text-right text-sm text-stone-600">{formatMoney(item.price, currency, exchangeRate)}</td>
                                <td className="px-4 py-3 text-center text-sm text-stone-600">
                                  {item.qty} {item.unit}
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-bold text-stone-900">{formatMoney(item.price * item.qty, currency, exchangeRate)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-6 space-y-3">
                        {[
                          ['Payment policy', policies.payment],
                          ['Cancellation policy', policies.cancellation],
                          ['Rate policy', policies.rate]
                        ].map(([title, value]) => (
                          <div key={title} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">{title}</p>
                            <p className="mt-2 text-sm leading-6 text-stone-600">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-3xl border border-stone-200 bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Summary</p>
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between text-sm text-stone-600">
                            <span>Subtotal</span>
                            <span className="font-semibold text-stone-900">{formatMoney(totals.subtotal, currency, exchangeRate)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-stone-600">
                            <span>Tax ({additionalCosts.tax}%)</span>
                            <span className="font-semibold text-stone-900">{formatMoney(totals.taxAmount, currency, exchangeRate)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-stone-600">
                            <span>Company share ({additionalCosts.companyShare}%)</span>
                            <span className="font-semibold text-stone-900">{formatMoney(totals.companyShareAmount, currency, exchangeRate)}</span>
                          </div>
                          <div className="rounded-2xl bg-emerald-800 px-4 py-4 text-white">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">Total due</p>
                            <p className="mt-2 text-2xl font-bold text-amber-300">{formatMoney(totals.total, currency, exchangeRate)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-emerald-800" />
                          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-800">Payment details</p>
                        </div>

                        <div className="mt-4 space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-stone-900">Bank transfer</p>
                            <div className="mt-2 space-y-1 text-sm text-stone-600">
                              <p>{paymentDetails.accountName || 'Account name'}</p>
                              <p>{paymentDetails.accountNumber || paymentDetails.accountDetails || 'Account number or details'}</p>
                              <p>{paymentDetails.bankName || 'Bank name'}</p>
                              <p>{paymentDetails.branchName || 'Branch name'}</p>
                              <p>{paymentDetails.swiftCode || 'SWIFT / BIC'}</p>
                            </div>
                          </div>

                          <div className="border-t border-emerald-200 pt-4">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-emerald-800" />
                              <p className="text-sm font-semibold text-stone-900">Mobile money</p>
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-stone-600">
                              <p>{paymentDetails.mobileProvider || 'Provider'}</p>
                              <p>{paymentDetails.mobileMoney || 'Mobile money number'}</p>
                              <p>{paymentDetails.mobileMoneyName || 'Registered name'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Prepared by</p>
                        <p className="mt-2 text-lg font-bold text-stone-900">{companyInfo.name || 'Your business name'}</p>
                        <p className="mt-1 text-sm text-stone-600">{companyInfo.address || 'Business address'}</p>
                        <p className="text-sm text-stone-600">{companyInfo.phone || 'Phone number'}</p>
                        <p className="text-sm text-stone-600">{companyInfo.email || 'Email address'}</p>
                      </div>

                      {currency === 'USD' && (
                        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                          Converted using 1 USD = {Math.round(exchangeRate || 0).toLocaleString()} UGX.
                        </div>
                      )}

                      <div className="print:hidden rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-stone-500" />
                          <p className="text-sm font-semibold text-stone-800">Investor-ready MVP move</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-stone-600">
                          This preview now behaves like a lightweight business workflow: setup, reuse, save, reopen, convert, and export.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            background: white;
          }

          @page {
            margin: 0.75cm;
            size: A4;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
