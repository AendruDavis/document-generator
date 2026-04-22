import React, { useState, useEffect } from 'react';
import { Download, Plus, Trash2, Building2, RefreshCw, CreditCard, Smartphone, ArrowRight, CheckCircle } from 'lucide-react';
import RichTextEditor, { normalizeRichText } from './components/RichTextEditor';

const InvoiceGenerator = () => {
  const [documentType, setDocumentType] = useState('quotation');
  const [currency, setCurrency] = useState('UGX');
  const [exchangeRate, setExchangeRate] = useState(3700);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(null);
  const [rateLastUpdated, setRateLastUpdated] = useState(null);

  const [companyInfo, setCompanyInfo] = useState({
    name: 'GALËNE HOLIDAYS AFRICA',
    tagline: 'CRAFTING UNIQUE SAFARIS',
    phone: '+256 701606674',
    email: 'galeneholidaysafrica@gmail.com',
    website: 'www.galeneholidaysafrica.com',
    address: 'Kampala, Uganda'
  });

  // Client info — shared across all document types
  const [clientInfo, setClientInfo] = useState({
    name: '',
    nationality: '',
    phone: '',
    email: '',
    pax: 1,
    arrivalDate: '',
    departureDate: ''
  });

  // Document-level details — each field used only where relevant
  const [documentDetails, setDocumentDetails] = useState({
    number: '001',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',      // quotation only
    dueDate: '',         // invoice only
    depositPaid: 0,      // invoice + receipt
    paymentMethod: 'bank' // receipt only: 'bank' | 'momo' | 'cash'
  });

  const [lineItems, setLineItems] = useState([
    { description: '', price: 0, qty: 1, unit: 'pax' }
  ]);

  const [additionalCosts, setAdditionalCosts] = useState({
    tax: 18,
    companyShare: 10
  });

  const [paymentDetails, setPaymentDetails] = useState({
    bankName: 'Stanbic Bank Uganda Limited',
    accountName: 'Galene Holidays Africa Limited',
    accountDetails: '9030026445247-UGX',
    accountNumber: '9030026445247',
    bankCode: '031003',
    branchCode: '04',
    branchName: 'Lugogo Branch',
    streetNameOfBank: 'Plot 17 Hannington Road, Kampala',
    swiftCode: 'SBICUGKX',
    mobileMoney: '+256 701606674',
    mobileMoneyName: 'Paul Edrine Basule',
    mobileProvider: 'MTN MoMo'
  });

  const [policies] = useState({
    payment: 'A payment of 100% on given permits is required on confirmation of your booking. A 50% deposit on reservation of the car rental and guide is also required on confirmation.',
    cancellation: 'Cancelled bookings forfeit 30% deposit if cancelled 60 days of arrival. 50% of the total booking will be charged for cancellation between 59 and 30 days before the arrival date.',
    rate: 'All rates are in US DOLLARS and a separate table of the government taxes and services charge but are subject to change without notice.'
  });

  const [letterContent, setLetterContent] = useState({
    subject: '',
    body: '<p>Write your letter here.</p>',
    closing: '<p>Sincerely,</p><p>Paul Edrine Basule<br />Director</p>'
  });

  // ── Convert quotation → invoice, carrying all data forward
  const convertToInvoice = () => {
    setDocumentType('invoice');
    setDocumentDetails(prev => ({
      ...prev,
      number: String(parseInt(prev.number || '1') + 1).padStart(3, '0'),
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      depositPaid: 0
    }));
  };

  const fetchExchangeRate = async () => {
    setRateLoading(true);
    setRateError(null);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data?.rates?.UGX) {
        setExchangeRate(Math.round(data.rates.UGX));
        setRateLastUpdated(new Date().toLocaleTimeString());
      } else throw new Error('Invalid response');
    } catch {
      setRateError('Could not fetch live rate');
    } finally {
      setRateLoading(false);
    }
  };

  useEffect(() => { fetchExchangeRate(); }, []);

  const calculateTotal = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
    const taxAmount = subtotal * (additionalCosts.tax / 100);
    const companyShareAmount = (subtotal + taxAmount) * (additionalCosts.companyShare / 100);
    const total = subtotal + taxAmount + companyShareAmount;
    const balanceDue = Math.max(0, total - (documentDetails.depositPaid || 0));
    return { subtotal, taxAmount, companyShareAmount, total, balanceDue };
  };

  // Prices stored in UGX; USD derived by dividing by exchange rate
  const formatCurrency = (ugxAmount) => {
    if (currency === 'UGX') return `UGX ${Math.round(ugxAmount).toLocaleString()}`;
    return `$${(ugxAmount / exchangeRate).toFixed(2)}`;
  };

  const addLineItem = () => setLineItems([...lineItems, { description: '', price: 0, qty: 1, unit: 'pax' }]);
  const removeLineItem = (i) => setLineItems(lineItems.filter((_, idx) => idx !== i));
  const updateLineItem = (i, field, value) => {
    const updated = [...lineItems];
    updated[i][field] = (field === 'price' || field === 'qty') ? parseFloat(value) || 0 : value;
    setLineItems(updated);
  };

  const totals = calculateTotal();
  const isLetter = documentType === 'letter';
  const isQuotation = documentType === 'quotation';
  const isInvoice = documentType === 'invoice';
  const isReceipt = documentType === 'receipt';

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  const inputClass = "w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1";

  const paymentMethodOptions = [
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'momo', label: 'Mobile Money' },
    { value: 'cash', label: 'Cash' }
  ];

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Navigation ── */}
      <div className="print:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-md flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Galene Document Generator</h1>
                <p className="text-xs text-emerald-100 hidden sm:block">Professional invoicing system</p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-all shadow-md font-semibold text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-20 sm:pt-24 print:pt-0 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">

            {/* ══ SIDEBAR ══ */}
            <div className="lg:col-span-2 print:hidden space-y-4">

              {/* Document Type */}
              <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4">
                <label className={labelClass}>Document Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['quotation', 'invoice', 'receipt', 'letter'].map((type) => (
                    <button key={type} onClick={() => setDocumentType(type)}
                      className={`px-3 py-2 rounded-md text-xs font-semibold transition-all ${documentType === type
                        ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency + Live Rate — not for letter */}
              {!isLetter && (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4">
                  <label className={labelClass}>Currency</label>
                  <div className="flex gap-2 mb-3">
                    {['UGX', 'USD'].map((c) => (
                      <button key={c} onClick={() => setCurrency(c)}
                        className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${currency === c
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>
                        {c === 'UGX' ? 'UGX' : 'USD ($)'}
                      </button>
                    ))}
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Live USD/UGX Rate</span>
                      <button onClick={fetchExchangeRate} disabled={rateLoading}
                        className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold disabled:opacity-50">
                        <RefreshCw className={`w-3 h-3 ${rateLoading ? 'animate-spin' : ''}`} /> Refresh
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" value={exchangeRate}
                        onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                        className="w-28 px-2 py-1 border border-emerald-300 rounded text-sm font-bold text-emerald-900 bg-white" />
                      <span className="text-xs text-emerald-700">UGX per $1</span>
                    </div>
                    {rateError && <p className="text-xs text-red-500 mt-1">{rateError} — editable above.</p>}
                    {rateLastUpdated && !rateError && <p className="text-xs text-emerald-600 mt-1">Updated at {rateLastUpdated}</p>}
                  </div>
                </div>
              )}

              {/* Company Information */}
              <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4">
                <label className={labelClass}>Company Information</label>
                <div className="space-y-2">
                  {[['name', 'Company Name'], ['tagline', 'Tagline'], ['phone', 'Phone'], ['email', 'Email'], ['website', 'Website']].map(([key, placeholder]) => (
                    <input key={key} type="text" placeholder={placeholder} value={companyInfo[key]}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, [key]: e.target.value })}
                      className={inputClass} />
                  ))}
                </div>
              </div>

              {/* Client Information — shared */}
              <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4">
                <label className={labelClass}>Client Information</label>
                <div className="space-y-2">
                  <input type="text" placeholder="Full Name" value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })} className={inputClass} />
                  <input type="text" placeholder="Nationality / Country" value={clientInfo.nationality}
                    onChange={(e) => setClientInfo({ ...clientInfo, nationality: e.target.value })} className={inputClass} />
                  <input type="text" placeholder="Phone" value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })} className={inputClass} />
                  <input type="email" placeholder="Email" value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })} className={inputClass} />

                  {/* Travel fields — not needed for letter */}
                  {!isLetter && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className={labelClass}>Arrival</p>
                          <input type="date" value={clientInfo.arrivalDate}
                            onChange={(e) => setClientInfo({ ...clientInfo, arrivalDate: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                          <p className={labelClass}>Departure</p>
                          <input type="date" value={clientInfo.departureDate}
                            onChange={(e) => setClientInfo({ ...clientInfo, departureDate: e.target.value })} className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <p className={labelClass}>No. of Guests (Pax)</p>
                        <input type="number" min="1" placeholder="1" value={clientInfo.pax}
                          onChange={(e) => setClientInfo({ ...clientInfo, pax: parseInt(e.target.value) || 1 })} className={inputClass} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Letter content */}
              {isLetter && (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4">
                  <label className={labelClass}>Letter Content</label>
                  <div className="space-y-4">
                    <input type="text" placeholder="Subject" value={letterContent.subject}
                      onChange={(e) => setLetterContent({ ...letterContent, subject: e.target.value })} className={inputClass} />
                    <RichTextEditor
                      label="Body"
                      value={letterContent.body}
                      onChange={(value) => setLetterContent({ ...letterContent, body: value })}
                      placeholder="Write the main body of the letter here..."
                      minHeight="280px"
                    />
                    <RichTextEditor
                      label="Closing"
                      value={letterContent.closing}
                      onChange={(value) => setLetterContent({ ...letterContent, closing: value })}
                      placeholder="Add your sign-off, signature, and title here..."
                      minHeight="180px"
                    />
                  </div>
                </div>
              )}

              {/* Document Details — varies by type */}
              {!isLetter && (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4">
                  <label className={labelClass}>Document Details</label>
                  <div className="space-y-2">
                    {/* Invoice number — invoice and receipt */}
                    {(isInvoice || isReceipt) && (
                      <div>
                        <p className={labelClass}>{isReceipt ? 'Receipt No.' : 'Invoice No.'}</p>
                        <input type="text" value={documentDetails.number}
                          onChange={(e) => setDocumentDetails({ ...documentDetails, number: e.target.value })}
                          className={inputClass} />
                      </div>
                    )}
                    {/* Date */}
                    <div>
                      <p className={labelClass}>Date</p>
                      <input type="date" value={documentDetails.date}
                        onChange={(e) => setDocumentDetails({ ...documentDetails, date: e.target.value })}
                        className={inputClass} />
                    </div>
                    {/* Valid Until — quotation only */}
                    {isQuotation && (
                      <div>
                        <p className={labelClass}>Valid Until</p>
                        <input type="date" value={documentDetails.validUntil}
                          onChange={(e) => setDocumentDetails({ ...documentDetails, validUntil: e.target.value })}
                          className={inputClass} />
                      </div>
                    )}
                    {/* Payment Due Date — invoice only */}
                    {isInvoice && (
                      <div>
                        <p className={labelClass}>Payment Due Date</p>
                        <input type="date" value={documentDetails.dueDate}
                          onChange={(e) => setDocumentDetails({ ...documentDetails, dueDate: e.target.value })}
                          className={inputClass} />
                      </div>
                    )}
                    {/* Deposit Paid — invoice + receipt */}
                    {(isInvoice || isReceipt) && (
                      <div>
                        <p className={labelClass}>Deposit / Amount Paid (UGX)</p>
                        <input type="number" placeholder="0" value={documentDetails.depositPaid}
                          onChange={(e) => setDocumentDetails({ ...documentDetails, depositPaid: parseFloat(e.target.value) || 0 })}
                          className={inputClass} />
                      </div>
                    )}
                    {/* Payment Method — receipt only */}
                    {isReceipt && (
                      <div>
                        <p className={labelClass}>Payment Method</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {paymentMethodOptions.map(({ value, label }) => (
                            <button key={value}
                              onClick={() => setDocumentDetails({ ...documentDetails, paymentMethod: value })}
                              className={`py-2 px-2 rounded-md text-xs font-semibold transition-all ${documentDetails.paymentMethod === value
                                ? 'bg-emerald-700 text-white'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Line Items — not for letter */}
              {!isLetter && (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className={`${labelClass} mb-0`}>Line Items</label>
                    <button onClick={addLineItem}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-all text-xs font-semibold">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {lineItems.map((item, index) => (
                      <div key={index} className="bg-stone-50 p-3 rounded-md border border-stone-200">
                        <input type="text" placeholder="Description" value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          className="w-full px-2 py-1.5 border border-stone-300 rounded-md text-xs mb-2" />
                        <div className="grid grid-cols-3 gap-1.5">
                          <input type="number" placeholder="Price (UGX)" value={item.price}
                            onChange={(e) => updateLineItem(index, 'price', e.target.value)}
                            className="px-2 py-1.5 border border-stone-300 rounded-md text-xs" />
                          <input type="number" placeholder="Qty" value={item.qty}
                            onChange={(e) => updateLineItem(index, 'qty', e.target.value)}
                            className="px-2 py-1.5 border border-stone-300 rounded-md text-xs" />
                          <input type="text" placeholder="Unit" value={item.unit}
                            onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                            className="px-2 py-1.5 border border-stone-300 rounded-md text-xs" />
                        </div>
                        <button onClick={() => removeLineItem(index)}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-md transition-all">
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Costs — not for letter or receipt */}
              {!isLetter && !isReceipt && (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4">
                  <label className={labelClass}>Additional Costs</label>
                  <div className="space-y-2">
                    {[['tax', 'Tax (%)'], ['companyShare', 'Company Share (%)']].map(([key, label]) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="flex-1 text-sm text-stone-700">{label}</span>
                        <input type="number" value={additionalCosts[key]}
                          onChange={(e) => setAdditionalCosts({ ...additionalCosts, [key]: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1.5 border border-stone-300 rounded-md text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Details — not for letter or quotation */}
              {!isLetter && !isQuotation && (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4">
                  <label className={`${labelClass} flex items-center gap-1.5`}>
                    <CreditCard className="w-3.5 h-3.5 text-emerald-700" /> Payment Details
                  </label>
                  <p className="text-xs text-stone-400 mb-3">Bank & mobile money shown on document</p>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Bank</p>
                    {[
                      ['accountName', 'Account Name'], ['accountDetails', 'Account Details'],
                      ['bankName', 'Bank Name'], ['branchName', 'Branch Name'],
                      ['streetNameOfBank', 'Street Name'], ['swiftCode', 'SWIFT / BIC Code'],
                      ['bankCode', 'Bank Code'], ['branchCode', 'Branch Code'],
                    ].map(([key, placeholder]) => (
                      <input key={key} type="text" placeholder={placeholder} value={paymentDetails[key]}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, [key]: e.target.value })}
                        className={inputClass} />
                    ))}
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider pt-1">Mobile Money</p>
                    {[
                      ['mobileProvider', 'Provider'], ['mobileMoney', 'Mobile Number'], ['mobileMoneyName', 'Registered Name'],
                    ].map(([key, placeholder]) => (
                      <input key={key} type="text" placeholder={placeholder} value={paymentDetails[key]}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, [key]: e.target.value })}
                        className={inputClass} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ══ DOCUMENT PREVIEW ══ */}
            <div className="lg:col-span-3 print:col-span-full">
              <div className="bg-white shadow-xl border border-stone-200 overflow-hidden print:shadow-none print:border-0">

                {/* ── LETTER ── */}
                {isLetter && (
                  <div className="p-8 sm:p-12 print:p-10">
                    <div className="border-b-4 border-amber-500 pb-4 mb-2 page-break-avoid">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h1 className="text-xl font-bold text-stone-900 tracking-tight mb-0.5">{companyInfo.name}</h1>
                          <p className="text-xs text-emerald-800 uppercase tracking-widest font-semibold">{companyInfo.tagline}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border border-amber-500 flex-shrink-0 overflow-hidden bg-emerald-50 flex items-center justify-center ml-4">
                          <img src="/galene.png" alt="Logo" className="w-full h-full object-cover "
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                          <span className="text-emerald-800 font-extrabold text-lg hidden">G</span>
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-stone-600">
                        <p>{companyInfo.phone}</p>
                        <p>{companyInfo.email}</p>
                        <p>{companyInfo.website}</p>

                      </div>
                    </div>
                    <p className="text-xs text-stone-500 mb-5">{formatDate(documentDetails.date)}</p>
                    <div className="mb-5">
                      <p className="font-semibold text-stone-900 text-sm">{clientInfo.name || 'Dear Guest,'}</p>
                      {clientInfo.phone && <p className="text-xs text-stone-500">{clientInfo.phone}</p>}
                      {clientInfo.email && <p className="text-xs text-stone-500">{clientInfo.email}</p>}

                    </div>
                    <div className="mb-5 pb-3 border-b border-stone-200">
                      <p className="font-semibold text-stone-900 text-sm"><span className="text-stone-500 font-normal">Re: </span>{letterContent.subject}</p>
                    </div>
                    <div
                      className="rich-text-content mb-10 text-stone-700 leading-relaxed text-sm"
                      dangerouslySetInnerHTML={{ __html: normalizeRichText(letterContent.body) || '<p>Write your letter here.</p>' }}
                    />
                    <div
                      className="rich-text-content text-stone-700 leading-relaxed text-sm"
                      dangerouslySetInnerHTML={{ __html: normalizeRichText(letterContent.closing) }}
                    />
                  </div>
                )}

                {/* ── QUOTATION / INVOICE / RECEIPT ── */}
                {!isLetter && (
                  <div>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-700 text-white px-6 sm:px-8 py-4 print:px-6 print:py-4 page-break-avoid">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-amber-400 bg-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            <img src="/galene.png" alt="Logo" className="w-full h-full object-cover "
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                            <span className="text-amber-300 font-extrabold text-lg hidden w-full h-full items-center justify-center">G</span>
                          </div>
                          <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-tight">{companyInfo.name}</h1>
                            <p className="text-xs uppercase tracking-widest text-emerald-200 font-semibold">{companyInfo.tagline}</p>
                            <div className="flex flex-wrap gap-x-3 text-xs text-emerald-100 mt-0.5">
                              <span>{companyInfo.email}</span>
                              <span>{companyInfo.phone}</span>
                              <span className="font-semibold">{companyInfo.website}</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto bg-black/20 backdrop-blur-sm px-4 py-3 rounded-md border border-white/20 min-w-[200px]">
                          <p className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-1">Bill To</p>
                          <p className="font-bold text-base sm:text-lg text-white leading-tight">
                            {clientInfo.name || <span className="opacity-30 text-sm">Client Name</span>}
                          </p>
                          {clientInfo.nationality && <p className="text-xs text-emerald-200">{clientInfo.nationality}</p>}
                          {clientInfo.phone && <p className="text-xs text-emerald-100">📞 {clientInfo.phone}</p>}
                          {clientInfo.email && <p className="text-xs text-emerald-100">✉️ {clientInfo.email}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Document Title Bar */}
                    <div className="bg-stone-100 border-b border-stone-200 py-2 px-6 page-break-avoid">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-stone-600">
                          {documentType}
                          {isInvoice && documentDetails.number && (
                            <span className="ml-2 text-stone-400 font-normal normal-case tracking-normal">#{documentDetails.number}</span>
                          )}
                          {isReceipt && documentDetails.number && (
                            <span className="ml-2 text-stone-400 font-normal normal-case tracking-normal">#{documentDetails.number}</span>
                          )}
                        </h2>
                        <div className="flex items-center gap-4 text-xs text-stone-500">
                          <span>Date: <strong className="text-stone-700">{formatDate(documentDetails.date)}</strong></span>
                          {isQuotation && documentDetails.validUntil && (
                            <span>Valid until: <strong className="text-amber-600">{formatDate(documentDetails.validUntil)}</strong></span>
                          )}
                          {isInvoice && documentDetails.dueDate && (
                            <span>Due: <strong className="text-red-600">{formatDate(documentDetails.dueDate)}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 print:p-5">

                      {/* Trip Summary — shown on all non-letter docs when dates/pax filled */}
                      {(clientInfo.arrivalDate || clientInfo.departureDate || clientInfo.pax > 1) && (
                        <div className="mb-4 grid grid-cols-3 gap-2 bg-stone-50 border border-stone-200 rounded-md p-3">
                          {clientInfo.arrivalDate && (
                            <div>
                              <p className="text-xs text-stone-400 uppercase tracking-wide">Arrival</p>
                              <p className="text-xs font-semibold text-stone-700">{formatDate(clientInfo.arrivalDate)}</p>
                            </div>
                          )}
                          {clientInfo.departureDate && (
                            <div>
                              <p className="text-xs text-stone-400 uppercase tracking-wide">Departure</p>
                              <p className="text-xs font-semibold text-stone-700">{formatDate(clientInfo.departureDate)}</p>
                            </div>
                          )}
                          {clientInfo.pax >= 1 && (
                            <div>
                              <p className="text-xs text-stone-400 uppercase tracking-wide">Guests</p>
                              <p className="text-xs font-semibold text-stone-700">{clientInfo.pax} pax</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Items Table */}
                      <div className="border border-stone-200 rounded-md overflow-hidden mb-4 page-break-avoid">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-stone-100 border-b border-stone-200">
                              {['Description', 'Unit Price', 'Qty', 'Total'].map((h, i) => (
                                <th key={h} className={`py-2 px-4 font-semibold text-xs text-stone-600 uppercase tracking-wide ${i === 0 ? 'text-left' : i === 2 ? 'text-center hidden sm:table-cell' : 'text-right'}`}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {lineItems.map((item, index) => (
                              <tr key={index} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                                <td className="py-2.5 px-4 text-stone-800 font-medium text-sm">
                                  {item.description || '—'}
                                  <span className="sm:hidden block text-xs text-stone-400 mt-0.5">{item.qty} {item.unit}</span>
                                </td>
                                <td className="py-2.5 px-4 text-right text-stone-600 text-sm">{formatCurrency(item.price)}</td>
                                <td className="py-2.5 px-4 text-center text-stone-600 text-sm hidden sm:table-cell">
                                  {item.qty} <span className="text-xs text-stone-400 uppercase">{item.unit}</span>
                                </td>
                                <td className="py-2.5 px-4 text-right font-semibold text-stone-900 text-sm">{formatCurrency(item.price * item.qty)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals — receipt shows a simplified version */}
                      <div className="space-y-1.5 mb-4 page-break-avoid">
                        {!isReceipt && (
                          <>
                            <div className="bg-stone-50 border border-stone-200 rounded-md py-2.5 px-4 flex justify-between items-center">
                              <span className="font-semibold text-stone-700 uppercase tracking-wide text-xs">Subtotal</span>
                              <span className="text-sm font-bold text-stone-900">{formatCurrency(totals.subtotal)}</span>
                            </div>
                            <div className="border border-stone-200 rounded-md py-2.5 px-4 flex justify-between items-center">
                              <span className="text-stone-600 text-sm">VAT <span className="font-medium">({additionalCosts.tax}%)</span></span>
                              <span className="text-sm font-semibold text-emerald-700">{formatCurrency(totals.taxAmount)}</span>
                            </div>
                            <div className="border border-stone-200 rounded-md py-2.5 px-4 flex justify-between items-center">
                              <span className="text-stone-600 text-sm">Company Share <span className="font-medium">({additionalCosts.companyShare}%)</span></span>
                              <span className="text-sm font-semibold text-emerald-700">{formatCurrency(totals.companyShareAmount)}</span>
                            </div>
                          </>
                        )}

                        {/* Grand Total */}
                        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-md py-3 px-4 flex justify-between items-center shadow-md">
                          <span className="font-semibold text-white text-sm uppercase tracking-wide">Total Amount</span>
                          <span className="text-lg font-bold text-amber-300">{formatCurrency(totals.total)}</span>
                        </div>

                        {/* Deposit & Balance — invoice and receipt */}
                        {(isInvoice || isReceipt) && documentDetails.depositPaid > 0 && (
                          <>
                            <div className="border border-stone-200 rounded-md py-2.5 px-4 flex justify-between items-center">
                              <span className="text-stone-600 text-sm">
                                {isReceipt ? 'Amount Received' : 'Deposit Paid'}
                                {isReceipt && documentDetails.paymentMethod && (
                                  <span className="ml-2 text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                                    {paymentMethodOptions.find(o => o.value === documentDetails.paymentMethod)?.label}
                                  </span>
                                )}
                              </span>
                              <span className="text-sm font-semibold text-stone-700">− {formatCurrency(documentDetails.depositPaid)}</span>
                            </div>
                            <div className={`rounded-md py-3 px-4 flex justify-between items-center border-2 ${totals.balanceDue === 0 ? 'bg-emerald-50 border-emerald-400' : 'bg-amber-50 border-amber-400'}`}>
                              <div className="flex items-center gap-2">
                                {totals.balanceDue === 0 && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                                <span className={`text-sm font-bold uppercase tracking-wide ${totals.balanceDue === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {totals.balanceDue === 0 ? 'Fully Paid' : 'Balance Due'}
                                </span>
                              </div>
                              <span className={`text-base font-bold ${totals.balanceDue === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {totals.balanceDue === 0 ? '✓ PAID' : formatCurrency(totals.balanceDue)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Exchange rate note when USD selected */}
                      {currency === 'USD' && (
                        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-md px-4 py-2.5 text-xs text-amber-800 font-medium">
                          💱 Converted at 1 USD = {exchangeRate.toLocaleString()} UGX. Rates are subject to change without notice.
                        </div>
                      )}

                      {/* Quotation validity note */}
                      {isQuotation && documentDetails.validUntil && (
                        <div className="mb-4 bg-stone-50 border border-stone-200 rounded-md px-4 py-2.5 text-xs text-stone-600">
                          ⏳ This quotation is valid until <strong>{formatDate(documentDetails.validUntil)}</strong>. Prices and availability are subject to change after this date.
                        </div>
                      )}

                      {/* Payment Details — invoice and receipt only */}
                      {(isInvoice || isReceipt) && (
                        <div className="mb-4 page-break-avoid">
                          <div className="border border-emerald-600 rounded-md overflow-hidden">
                            <div className="bg-emerald-800 px-4 py-2.5 flex items-center gap-2">
                              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                              <h3 className="font-semibold text-white uppercase tracking-wider text-xs">Payment Details</h3>
                            </div>
                            <div className="p-4 grid sm:grid-cols-2 gap-4 bg-emerald-50/30">
                              <div>
                                <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-amber-400">
                                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                                  <h4 className="font-semibold text-stone-700 text-xs uppercase tracking-wide">Bank Transfer</h4>
                                </div>
                                <div className="space-y-1.5">
                                  {[
                                    ['Account Name', paymentDetails.accountName],
                                    ['Account Details', paymentDetails.accountDetails],
                                    ['Bank', paymentDetails.bankName],
                                    ['Branch', paymentDetails.branchName],
                                    ['Street Name', paymentDetails.streetNameOfBank],
                                    ['Swift Code', paymentDetails.swiftCode],
                                    ['Bank Code', paymentDetails.bankCode],
                                    ['Branch Code', paymentDetails.branchCode],
                                  ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between items-start gap-2">
                                      <span className="text-xs text-stone-400 font-medium shrink-0 w-24">{label}</span>
                                      <span className="text-xs font-semibold text-stone-700 text-right">{value || '—'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-amber-400">
                                  <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                                  <h4 className="font-semibold text-stone-700 text-xs uppercase tracking-wide">Mobile Money</h4>
                                </div>
                                <div className="space-y-1.5">
                                  {[
                                    ['Provider', paymentDetails.mobileProvider],
                                    ['Number', paymentDetails.mobileMoney],
                                    ['Name', paymentDetails.mobileMoneyName],
                                  ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between items-start gap-2">
                                      <span className="text-xs text-stone-400 font-medium shrink-0 w-24">{label}</span>
                                      <span className="text-xs font-semibold text-stone-700 text-right">{value || '—'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Policies — quotation and invoice only (not receipt) */}
                      {(isQuotation || isInvoice) && (
                        <div className="space-y-2 mb-4">
                          {[['Payment Policy', 'payment'], ['Cancellation Policy', 'cancellation'], ['Rate Policy', 'rate']].map(([title, key]) => (
                            <div key={key} className="border border-stone-200 rounded-md p-3 bg-stone-50 page-break-avoid">
                              <h3 className="font-semibold text-stone-800 mb-1.5 uppercase tracking-wide text-xs pb-1.5 border-b border-amber-400">{title}</h3>
                              <p className="text-xs text-stone-600 leading-relaxed">{policies[key]}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Signature */}
                      <div className="border-t border-stone-200 pt-3 page-break-avoid">
                        <div className="flex items-end justify-between">
                          {/* Convert to Invoice button — quotation only, hidden on print */}
                          {isQuotation && (
                            <button onClick={convertToInvoice}
                              className="print:hidden flex items-center gap-2 px-3 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-all text-xs font-semibold">
                              <ArrowRight className="w-3.5 h-3.5" /> Convert to Invoice
                            </button>
                          )}
                          {!isQuotation && <div />}
                          <div className="text-right">
                            <p className="font-bold text-stone-900 text-sm">PAUL EDRINE BASULE</p>
                            <p className="text-xs text-stone-500 uppercase tracking-wide">Director</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rich-text-editor:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
        }
        .rich-text-content p {
          margin: 0 0 0.9rem;
        }
        .rich-text-content p:last-child {
          margin-bottom: 0;
        }
        .rich-text-content h1,
        .rich-text-content h2,
        .rich-text-content h3 {
          color: #1c1917;
          font-weight: 700;
          line-height: 1.25;
          margin: 1.2rem 0 0.75rem;
        }
        .rich-text-content h1 {
          font-size: 1.5rem;
        }
        .rich-text-content h2 {
          font-size: 1.25rem;
        }
        .rich-text-content h3 {
          font-size: 1.1rem;
        }
        .rich-text-content ul,
        .rich-text-content ol {
          margin: 0.9rem 0 0.9rem 1.5rem;
          padding-left: 0.5rem;
        }
        .rich-text-content ul {
          list-style: disc;
        }
        .rich-text-content ol {
          list-style: decimal;
        }
        .rich-text-content a {
          color: #047857;
          text-decoration: underline;
        }
        @media print {
          body { margin: 0; padding: 0; background: white; }
          @page { margin: 0.5cm; size: A4; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .page-break-avoid { page-break-inside: avoid; break-inside: avoid; }
          html, body { height: auto; overflow: visible; }
        }
        @media (max-width: 640px) {
          input, textarea, button, .rich-text-editor { font-size: 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default InvoiceGenerator;
