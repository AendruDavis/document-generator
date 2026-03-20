import React, { useState, useEffect } from 'react';
import { Download, Plus, Trash2, Building2, RefreshCw, CreditCard, Smartphone } from 'lucide-react';

const InvoiceGenerator = () => {
  const [documentType, setDocumentType] = useState('price quotation');
  const [currency, setCurrency] = useState('UGX'); // ← DEFAULT UGX
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

  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [documentDetails, setDocumentDetails] = useState({
    number: '001',
    date: new Date().toISOString().split('T')[0]
  });

  const [lineItems, setLineItems] = useState([
    { description: '', price: 0, qty: 1, unit: 'pax' } // price stored in UGX
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

  const [policies, setPolicies] = useState({
    payment: 'A payment of 100% on given permits is required on confirmation of your booking. A 50% deposit on reservation of the car rental and guide is also required on confirmation.',
    cancellation: 'Cancelled bookings forfeit 30% deposit if cancelled 60 days of arrival. 50% of the total booking will be charged for cancellation between 59 and 30 days before the arrival date.',
    rate: 'All rates are in US DOLLARS and a separate table of the government taxes and services charge but are subject to change without notice.'
  });

  const [letterContent, setLetterContent] = useState({
    subject: '',
    body: '',
    closing: 'Sincerely,\n\nPaul Edrine Basude\nDirector'
  });

  const fetchExchangeRate = async () => {
    setRateLoading(true);
    setRateError(null);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data && data.rates && data.rates.UGX) {
        setExchangeRate(Math.round(data.rates.UGX));
        setRateLastUpdated(new Date().toLocaleTimeString());
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      setRateError('Could not fetch live rate');
    } finally {
      setRateLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const calculateTotal = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
    const taxAmount = subtotal * (additionalCosts.tax / 100);
    const companyShareAmount = (subtotal + taxAmount) * (additionalCosts.companyShare / 100);
    const total = subtotal + taxAmount + companyShareAmount;
    return { subtotal, taxAmount, companyShareAmount, total };
  };

  // Prices are stored in UGX. USD is derived by dividing by exchange rate.
  const formatCurrency = (ugxAmount) => {
    if (currency === 'UGX') {
      return `UGX ${Math.round(ugxAmount).toLocaleString()}`;
    }
    return `$${(ugxAmount / exchangeRate).toFixed(2)}`;
  };

  const formatUnitPrice = (ugxAmount) => {
    if (currency === 'UGX') {
      return `UGX ${Math.round(ugxAmount).toLocaleString()}`;
    }
    return `$${(ugxAmount / exchangeRate).toFixed(2)}`;
  };

  const addLineItem = () => setLineItems([...lineItems, { description: '', price: 0, qty: 1, unit: 'pax' }]);
  const removeLineItem = (index) => setLineItems(lineItems.filter((_, i) => i !== index));
  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = field === 'price' || field === 'qty' ? parseFloat(value) || 0 : value;
    setLineItems(updated);
  };

  const totals = calculateTotal();

  const inputClass = "w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm";

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation Bar */}
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

            {/* Sidebar Controls */}
            <div className="lg:col-span-2 print:hidden space-y-4 sm:space-y-6">

              {/* Document Type */}
              <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 sm:p-6">
                <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">Document Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['quotation', 'invoice', 'receipt', 'letter'].map((type) => (
                    <button key={type} onClick={() => setDocumentType(type)}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-semibold transition-all ${documentType === type
                        ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency + Live Rate */}
              {documentType !== 'letter' && (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 sm:p-6">
                  <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">Currency</label>
                  <div className="flex gap-2 mb-4">
                    {['UGX', 'USD'].map((c) => (
                      <button key={c} onClick={() => setCurrency(c)}
                        className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-semibold transition-all ${currency === c
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>
                        {c === 'UGX' ? 'UGX' : 'USD ($)'}
                      </button>
                    ))}
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Live USD/UGX Rate</span>
                      <button onClick={fetchExchangeRate} disabled={rateLoading}
                        className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold transition-colors disabled:opacity-50">
                        <RefreshCw className={`w-3 h-3 ${rateLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                        className="w-28 px-2 py-1 border border-emerald-300 rounded text-sm font-bold text-emerald-900 bg-white"
                      />
                      <span className="text-xs text-emerald-700">UGX per $1</span>
                    </div>
                    {rateError && <p className="text-xs text-red-500 mt-1">{rateError} — rate is editable above.</p>}
                    {rateLastUpdated && !rateError && <p className="text-xs text-emerald-600 mt-1">Updated at {rateLastUpdated}</p>}
                  </div>
                </div>
              )}

              {/* Company Information */}
              <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 sm:p-6">
                <h2 className="text-xs sm:text-sm font-bold text-stone-800 mb-3 sm:mb-4 uppercase tracking-wider">Company Information</h2>
                <div className="space-y-2 sm:space-y-3">
                  {[['name', 'Company Name'], ['tagline', 'Tagline'], ['phone', 'Phone'], ['email', 'Email'], ['website', 'Website']].map(([key, placeholder]) => (
                    <input key={key} type="text" placeholder={placeholder} value={companyInfo[key]}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, [key]: e.target.value })}
                      className={inputClass} />
                  ))}
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 sm:p-6">
                <h2 className="text-xs sm:text-sm font-bold text-stone-800 mb-3 sm:mb-4 uppercase tracking-wider">Client Information</h2>
                <div className="space-y-2 sm:space-y-3">
                  {[['name', 'text', 'Client Name'], ['phone', 'text', 'Client Phone'], ['email', 'email', 'Client Email']].map(([key, type, placeholder]) => (
                    <input key={key} type={type} placeholder={placeholder} value={clientInfo[key]}
                      onChange={(e) => setClientInfo({ ...clientInfo, [key]: e.target.value })}
                      className={inputClass} />
                  ))}
                </div>
              </div>

              {documentType === 'letter' ? (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 sm:p-6">
                  <h2 className="text-xs sm:text-sm font-bold text-stone-800 mb-3 sm:mb-4 uppercase tracking-wider">Letter Content</h2>
                  <div className="space-y-2 sm:space-y-3">
                    <input type="text" placeholder="Subject" value={letterContent.subject}
                      onChange={(e) => setLetterContent({ ...letterContent, subject: e.target.value })} className={inputClass} />
                    <textarea placeholder="Letter Body" value={letterContent.body}
                      onChange={(e) => setLetterContent({ ...letterContent, body: e.target.value })}
                      rows={8} className={inputClass} />
                    <textarea placeholder="Closing" value={letterContent.closing}
                      onChange={(e) => setLetterContent({ ...letterContent, closing: e.target.value })}
                      rows={4} className={inputClass} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Line Items */}
                  <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h2 className="text-xs sm:text-sm font-bold text-stone-800 uppercase tracking-wider">Line Items</h2>
                      <button onClick={addLineItem}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-all text-xs sm:text-sm font-semibold shadow-sm">
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add
                      </button>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {lineItems.map((item, index) => (
                        <div key={index} className="bg-stone-50 p-3 sm:p-4 rounded-md border border-stone-200">
                          <div className="space-y-2">
                            <input type="text" placeholder="Description" value={item.description}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              className="w-full px-2 sm:px-3 py-2 border border-stone-300 rounded-md text-xs sm:text-sm" />
                            <div className="grid grid-cols-3 gap-2">
                              <input type="number" placeholder="Price (UGX)" value={item.price}
                                onChange={(e) => updateLineItem(index, 'price', e.target.value)}
                                className="px-2 sm:px-3 py-2 border border-stone-300 rounded-md text-xs sm:text-sm" />
                              <input type="number" placeholder="Qty" value={item.qty}
                                onChange={(e) => updateLineItem(index, 'qty', e.target.value)}
                                className="px-2 sm:px-3 py-2 border border-stone-300 rounded-md text-xs sm:text-sm" />
                              <input type="text" placeholder="Unit" value={item.unit}
                                onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                                className="px-2 sm:px-3 py-2 border border-stone-300 rounded-md text-xs sm:text-sm" />
                            </div>
                          </div>
                          <button onClick={() => removeLineItem(index)}
                            className="mt-2 p-2 text-red-600 hover:bg-red-50 rounded-md transition-all w-full flex items-center justify-center gap-2 text-xs sm:text-sm">
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /> Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Costs */}
                  <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 sm:p-6">
                    <h2 className="text-xs sm:text-sm font-bold text-stone-800 mb-3 sm:mb-4 uppercase tracking-wider">Additional Costs</h2>
                    <div className="space-y-2 sm:space-y-3">
                      {[['tax', 'Tax (%)'], ['companyShare', 'Company Share (%)']].map(([key, label]) => (
                        <div key={key} className="flex items-center gap-3">
                          <label className="flex-1 text-xs sm:text-sm font-medium text-stone-700">{label}</label>
                          <input type="number" value={additionalCosts[key]}
                            onChange={(e) => setAdditionalCosts({ ...additionalCosts, [key]: parseFloat(e.target.value) || 0 })}
                            className="w-20 sm:w-24 px-2 sm:px-3 py-2 border border-stone-300 rounded-md text-xs sm:text-sm" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Details Sidebar */}
                  <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 sm:p-6">
                    <h2 className="text-xs sm:text-sm font-bold text-stone-800 mb-1 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-700" /> Payment Details
                    </h2>
                    <p className="text-xs text-stone-500 mb-4">Bank & mobile money info shown on document</p>
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Bank Details</p>
                      {[
                        ['accountName', 'Account Name'],
                        ['accountDetails', 'Account Details'],
                        ['bankName', 'Bank Name'],
                        ['branchName', 'Branch Name'],
                        ['streetNameOfBank', 'Street Name Of The Bank'],
                        ['swiftCode', 'SWIFT / BIC Code'],
                        ['bankCode', 'Bank Code'],
                        ['branchCode', 'Branch Code'],
                      ].map(([key, placeholder]) => (
                        <input key={key} type="text" placeholder={placeholder} value={paymentDetails[key]}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, [key]: e.target.value })}
                          className={inputClass} />
                      ))}
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider pt-2">Mobile Money</p>
                      {[
                        ['mobileProvider', 'Provider (e.g. MTN MoMo)'],
                        ['mobileMoney', 'Mobile Number'],
                        ['mobileMoneyName', 'Registered Name'],
                      ].map(([key, placeholder]) => (
                        <input key={key} type="text" placeholder={placeholder} value={paymentDetails[key]}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, [key]: e.target.value })}
                          className={inputClass} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Document Preview */}
            <div className="lg:col-span-3 print:col-span-full">
              <div className="bg-white shadow-xl border border-stone-200 overflow-hidden print:shadow-none print:border-0">

                {documentType === 'letter' ? (
                  <div className="p-8 sm:p-12 lg:p-16 print:p-12">
                    <div className="border-b-4 border-amber-500 pb-4 sm:pb-6 mb-6 sm:mb-8 page-break-avoid">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1">
                          <h1 className="text-xl sm:text-2xl lg:text-3xl print:text-2xl font-bold text-stone-900 tracking-tight mb-1">{companyInfo.name}</h1>
                          <p className="text-xs sm:text-sm print:text-xs text-emerald-800 uppercase tracking-widest font-semibold">{companyInfo.tagline}</p>
                        </div>
                        {/* Logo in letter header */}
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-amber-500 flex-shrink-0 overflow-hidden bg-emerald-50 flex items-center justify-center ml-4">
                          <img src="/galene-logo.png" alt="Logo" className="w-full h-full object-contain p-1"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                          <span className="text-emerald-800 font-extrabold text-2xl hidden">G</span>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-6 text-sm sm:text-base text-stone-700 space-y-1">
                        <p className="font-medium">{companyInfo.phone}</p>
                        <p className="text-emerald-800 font-medium">{companyInfo.email}</p>
                        <p className="text-emerald-800 font-medium">{companyInfo.website}</p>
                      </div>
                    </div>
                    <div className="mb-6 sm:mb-8">
                      <p className="text-sm sm:text-base text-stone-600 font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="mb-6 sm:mb-8">
                      <p className="font-bold text-stone-900 text-xl sm:text-2xl mb-2">{clientInfo.name}</p>
                      <p className="text-sm sm:text-base text-stone-600">{clientInfo.email}</p>
                      <p className="text-sm sm:text-base text-stone-600">{clientInfo.phone}</p>
                    </div>
                    <div className="mb-6 sm:mb-8 pb-3 border-b border-stone-200">
                      <p className="font-bold text-stone-900 text-base sm:text-lg"><span className="text-stone-600">Re:</span> {letterContent.subject}</p>
                    </div>
                    <div className="mb-10 sm:mb-16 whitespace-pre-wrap text-stone-700 leading-relaxed text-base sm:text-lg">{letterContent.body}</div>
                    <div className="whitespace-pre-wrap text-stone-700 leading-relaxed text-base sm:text-lg">{letterContent.closing}</div>
                  </div>
                ) : (
                  <div>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-700 text-white px-6 sm:px-8 lg:px-10 py-4 sm:py-5 print:px-6 print:py-4 page-break-avoid">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">

                        {/* Left: Logo + company */}
                        <div className="flex items-center gap-3 flex-1">
                          {/* Logo circle */}
                          <div className="w-10 h-10 sm:w-12 sm:h-12 print:w-10 print:h-10 rounded-full border border-amber-400 bg-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            <img
                              src="/galene-logo.png"
                              alt="Galene Holidays Africa"
                              className="w-full h-full object-contain p-0.5"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                            <span className="text-amber-300 font-extrabold text-lg hidden w-full h-full items-center justify-center">G</span>
                          </div>
                          <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-tight">{companyInfo.name}</h1>
                            <p className="text-xs uppercase tracking-widest text-emerald-200 font-semibold">{companyInfo.tagline}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-0 text-xs text-emerald-100 mt-0.5">
                              <span>{companyInfo.email}</span>
                              <span>{companyInfo.phone}</span>
                              <span className="font-semibold">{companyInfo.website}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Client info */}
                        <div className="w-full sm:w-auto bg-black/20 backdrop-blur-sm px-4 py-3 rounded-md border border-white/20 min-w-[200px]">
                          <p className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-1">Bill To</p>
                          <p className="font-bold text-base sm:text-lg text-white leading-tight">
                            {clientInfo.name || <span className="opacity-30 text-sm">Client Name</span>}
                          </p>
                          <div className="flex flex-col gap-0">
                            {clientInfo.phone && (
                              <p className="text-xs text-emerald-100"><i className="fas fa-phone-alt mr-1"></i> {clientInfo.phone}</p>
                            )}
                            {clientInfo.email && (
                              <p className="text-xs text-emerald-100"><i className="fas fa-envelope mr-1"></i> {clientInfo.email}</p>
                            )}
                            {!clientInfo.phone && !clientInfo.email && (
                              <p className="text-xs text-white/30 italic">No contact details</p>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Document Title Bar */}
                    <div className="bg-stone-100 border-b border-stone-200 py-2 px-6 page-break-avoid">
                      <h2 className="text-sm font-bold uppercase tracking-widest text-stone-600 text-center">{documentType}</h2>
                    </div>

                    <div className="p-6 print:p-5">
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
                                <td className="py-2.5 px-4 text-right text-stone-600 text-sm">
                                  {formatUnitPrice(item.price)}
                                </td>
                                <td className="py-2.5 px-4 text-center text-stone-600 text-sm hidden sm:table-cell">
                                  {item.qty} <span className="text-xs text-stone-400 uppercase">{item.unit}</span>
                                </td>
                                <td className="py-2.5 px-4 text-right font-semibold text-stone-900 text-sm">
                                  {formatCurrency(item.price * item.qty)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals */}
                      <div className="space-y-1.5 mb-5 page-break-avoid">
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
                        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-md py-3 px-4 flex justify-between items-center shadow-md">
                          <span className="font-semibold text-white text-sm uppercase tracking-wide">Total Amount</span>
                          <span className="text-lg font-bold text-amber-300">{formatCurrency(totals.total)}</span>
                        </div>
                      </div>

                      {/* Exchange rate note when USD selected */}
                      {currency === 'USD' && (
                        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-md px-4 py-2.5 text-xs text-amber-800 font-medium">
                          Converted at 1 USD = {exchangeRate.toLocaleString()} UGX. Rates are subject to change without notice.
                        </div>
                      )}

                      {/* Payment Details */}
                      <div className="mb-4 page-break-avoid">
                        <div className="border border-emerald-600 rounded-md overflow-hidden">
                          <div className="bg-emerald-800 px-4 py-2.5 flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                            <h3 className="font-semibold text-white uppercase tracking-wider text-xs">Payment Details</h3>
                          </div>
                          <div className="p-4 grid sm:grid-cols-2 gap-4 bg-emerald-50/30">
                            {/* Bank Transfer */}
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
                            {/* Mobile Money */}
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

                      {/* Policies */}
                      <div className="space-y-2 mb-5">
                        {[['Payment Policy', 'payment'], ['Cancellation Policy', 'cancellation'], ['Rate Policy', 'rate']].map(([title, key]) => (
                          <div key={key} className="border border-stone-200 rounded-md p-3 bg-stone-50 page-break-avoid">
                            <h3 className="font-semibold text-stone-800 mb-1.5 uppercase tracking-wide text-xs pb-1.5 border-b border-amber-400">{title}</h3>
                            <p className="text-xs text-stone-600 leading-relaxed">{policies[key]}</p>
                          </div>
                        ))}
                      </div>

                      {/* Signature */}
                      <div className="border-t border-stone-200 pt-3 page-break-avoid">
                        <div className="text-right">
                          <p className="font-bold text-stone-900 text-sm">PAUL EDRINE BASULE</p>
                          <p className="text-xs text-stone-500 uppercase tracking-wide">Director</p>
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
        @media print {
          body { margin: 0; padding: 0; background: white; }
          @page { margin: 0.5cm; size: A4; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .page-break-avoid { page-break-inside: avoid; break-inside: avoid; }
          html, body { height: auto; overflow: visible; }
        }
        @media (max-width: 640px) {
          input, textarea, button { font-size: 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default InvoiceGenerator;