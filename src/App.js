import React, { useState, useEffect } from 'react';
import { Download, Plus, Trash2, Building2, RefreshCw, CreditCard, Smartphone } from 'lucide-react';

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
    { description: '', price: 0, qty: 1, unit: 'pax' }
  ]);

  const [additionalCosts, setAdditionalCosts] = useState({
    tax: 18,
    companyShare: 10
  });

  // Payment Details State
  const [paymentDetails, setPaymentDetails] = useState({
    bankName: 'Stanbic Bank Uganda',
    accountName: 'Galene Holidays Africa',
    accountNumber: '9030012345678',
    branch: 'Kampala Branch',
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

  // Fetch live exchange rate
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

  const formatCurrency = (amount) => {
    if (currency === 'USD') return `$${amount.toFixed(2)}`;
    return `UGX ${Math.round(amount * exchangeRate).toLocaleString()}`;
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
                    {['USD', 'UGX'].map((c) => (
                      <button key={c} onClick={() => setCurrency(c)}
                        className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-semibold transition-all ${currency === c
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>
                        {c === 'USD' ? 'USD ($)' : 'UGX'}
                      </button>
                    ))}
                  </div>

                  {/* Live Exchange Rate */}
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
                                <input type="number" placeholder="Price" value={item.price}
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
                          ['bankName', 'Bank Name'],
                          ['accountName', 'Account Name'],
                          ['accountNumber', 'Account Number'],
                          ['branch', 'Branch'],
                          ['swiftCode', 'SWIFT / BIC Code'],
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
                        <div className="w-12 h-12 sm:w-16 sm:h-16 print:w-12 print:h-12 rounded-md flex-shrink-0">
                          <img src="/galene-logo.png" alt="Logo" className="w-full h-full object-contain p-2" />
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-stone-700 space-y-1">
                        <p className="font-medium">{companyInfo.phone}</p>
                        <p className="text-emerald-800 font-medium">{companyInfo.email}</p>
                        <p className="text-emerald-800 font-medium">{companyInfo.website}</p>
                      </div>
                    </div>
                    <div className="mb-6 sm:mb-8"><p className="text-xs sm:text-sm text-stone-600 font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                    <div className="mb-6 sm:mb-8">
                      <p className="font-bold text-stone-900 text-base sm:text-lg mb-2">{clientInfo.name}</p>
                      <p className="text-xs sm:text-sm text-stone-600">{clientInfo.email}</p>
                      <p className="text-xs sm:text-sm text-stone-600">{clientInfo.phone}</p>
                    </div>
                    <div className="mb-6 sm:mb-8 pb-3 border-b border-stone-200">
                      <p className="font-bold text-stone-900 text-sm sm:text-base"><span className="text-stone-600">Re:</span> {letterContent.subject}</p>
                    </div>
                    <div className="mb-10 sm:mb-16 whitespace-pre-wrap text-stone-700 leading-relaxed text-sm sm:text-base">{letterContent.body}</div>
                    <div className="whitespace-pre-wrap text-stone-700 leading-relaxed text-sm sm:text-base">{letterContent.closing}</div>
                  </div>
                ) : (
                  <div>
                    {/* Header */}
                      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white p-6 sm:p-8 lg:p-10 print:p-6 page-break-avoid">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 lg:gap-8">
                          <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl print:text-2xl font-bold tracking-tight mb-2">{companyInfo.name}</h1>
                            <p className="text-xs sm:text-sm uppercase tracking-widest text-emerald-100 font-semibold mb-4 sm:mb-6">{companyInfo.tagline}</p>
                            <div className="space-y-1 text-xs sm:text-sm text-emerald-50">
                              <p>{companyInfo.phone}</p>
                              <p>{companyInfo.email}</p>
                              <p className="font-semibold">{companyInfo.website}</p>
                            </div>
                        </div>
                          <div className="w-full sm:w-auto text-left sm:text-right bg-black/20 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-md border border-white/20">
                            <p className="text-xs uppercase tracking-wider text-emerald-100 mb-2">Bill To</p>
                            <p className="font-bold text-base sm:text-lg mb-2 sm:mb-3">{clientInfo.name}</p>
                            <div className="text-xs sm:text-sm space-y-1 text-emerald-50">
                              <p>{clientInfo.phone}</p>
                              <p>{clientInfo.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Document Title Bar */}
                      <div className="bg-stone-900 text-white py-3 sm:py-4 lg:py-5 px-6 sm:px-8 lg:px-10 page-break-avoid">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold uppercase tracking-wider">{documentType}</h2>
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Document Number</p>
                            <p className="font-bold text-base sm:text-lg text-amber-400">{documentDetails.number}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 sm:p-8 lg:p-10 print:p-6">
                        {/* Items Table */}
                        <div className="border-2 border-stone-200 rounded-md overflow-hidden mb-4 sm:mb-6 page-break-avoid">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-stone-100 border-b-2 border-stone-300">
                                {['Description', 'Price', 'Qty', 'Total'].map((h, i) => (
                                  <th key={h} className={`py-2 sm:py-3 px-3 sm:px-4 lg:px-6 font-bold text-xs sm:text-sm text-stone-800 uppercase tracking-wide ${i === 0 ? 'text-left' : i === 2 ? 'text-center hidden sm:table-cell' : 'text-right'}`}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {lineItems.map((item, index) => (
                                <tr key={index} className="border-b border-stone-200 hover:bg-stone-50 transition-colors">
                                  <td className="py-2 sm:py-3 px-3 sm:px-4 lg:px-6 text-stone-800 font-medium text-xs sm:text-sm">
                                  {item.description}
                                    <span className="sm:hidden block text-xs text-stone-500 mt-1">{item.qty} {item.unit}</span>
                                </td>
                                  <td className="py-2 sm:py-3 px-3 sm:px-4 lg:px-6 text-right text-stone-700 text-xs sm:text-sm">
                                  {currency === 'USD' ? `$${item.price.toFixed(2)}` : `${item.price.toFixed(2)}`}
                                </td>
                                  <td className="py-2 sm:py-3 px-3 sm:px-4 lg:px-6 text-center text-stone-700 text-xs sm:text-sm hidden sm:table-cell">
                                  {item.qty} <span className="text-xs text-stone-500 uppercase">{item.unit}</span>
                                </td>
                                  <td className="py-2 sm:py-3 px-3 sm:px-4 lg:px-6 text-right font-bold text-stone-900 text-xs sm:text-sm">
                                  {formatCurrency(item.price * item.qty)}
                                </td>
                              </tr>
                            ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 page-break-avoid">
                          <div className="bg-stone-100 border-2 border-stone-300 rounded-md py-2 sm:py-3 px-4 sm:px-6 flex justify-between items-center">
                            <span className="font-bold text-stone-800 uppercase tracking-wide text-xs sm:text-sm">Subtotal</span>
                            <span className="text-base sm:text-xl font-bold text-stone-900">{formatCurrency(totals.subtotal)}</span>
                          </div>
                          <div className="border-2 border-stone-200 rounded-md py-2 sm:py-3 px-4 sm:px-6 flex justify-between items-center">
                            <span className="text-stone-700 text-xs sm:text-sm">VAT <span className="font-semibold">({additionalCosts.tax}%)</span></span>
                            <span className="text-sm sm:text-lg font-bold text-emerald-700">{formatCurrency(totals.taxAmount)}</span>
                          </div>
                          <div className="border-2 border-stone-200 rounded-md py-2 sm:py-3 px-4 sm:px-6 flex justify-between items-center">
                            <span className="text-stone-700 text-xs sm:text-sm">Company Share <span className="font-semibold">({additionalCosts.companyShare}%)</span></span>
                            <span className="text-sm sm:text-lg font-bold text-emerald-700">{formatCurrency(totals.companyShareAmount)}</span>
                          </div>
                          <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-md py-3 sm:py-4 px-4 sm:px-6 flex justify-between items-center shadow-lg">
                            <span className="font-bold text-white text-sm sm:text-lg uppercase tracking-wide">Total Amount</span>
                            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-300">{formatCurrency(totals.total)}</span>
                          </div>
                        </div>

                        {/* ===== PAYMENT DETAILS SECTION ===== */}
                        <div className="mb-6 sm:mb-8 page-break-avoid">
                          <div className="border-2 border-emerald-700 rounded-md overflow-hidden">
                            {/* Section Header */}
                            <div className="bg-emerald-800 px-4 sm:px-6 py-3 flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-amber-400" />
                              <h3 className="font-bold text-white uppercase tracking-wider text-xs sm:text-sm">Payment Details</h3>
                          </div>

                            <div className="p-4 sm:p-6 grid sm:grid-cols-2 gap-4 sm:gap-6 bg-emerald-50/40">
                              {/* Bank Transfer */}
                              <div>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-amber-500">
                                  <CreditCard className="w-4 h-4 text-emerald-700" />
                                  <h4 className="font-bold text-stone-800 text-xs sm:text-sm uppercase tracking-wide">Bank Transfer</h4>
                                </div>
                                <div className="space-y-2">
                                  {[
                                    ['Bank', paymentDetails.bankName],
                                    ['Account Name', paymentDetails.accountName],
                                    ['Account No.', paymentDetails.accountNumber],
                                    ['Branch', paymentDetails.branch],
                                    ['SWIFT / BIC', paymentDetails.swiftCode],
                                  ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between items-start gap-2">
                                      <span className="text-xs text-stone-500 font-medium shrink-0 w-24">{label}</span>
                                      <span className="text-xs sm:text-sm font-semibold text-stone-800 text-right">{value || '—'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Mobile Money */}
                              <div>
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-amber-500">
                                  <Smartphone className="w-4 h-4 text-emerald-700" />
                                  <h4 className="font-bold text-stone-800 text-xs sm:text-sm uppercase tracking-wide">Mobile Money</h4>
                                </div>
                                <div className="space-y-2">
                                  {[
                                    ['Provider', paymentDetails.mobileProvider],
                                    ['Number', paymentDetails.mobileMoney],
                                    ['Name', paymentDetails.mobileMoneyName],
                                  ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between items-start gap-2">
                                      <span className="text-xs text-stone-500 font-medium shrink-0 w-24">{label}</span>
                                      <span className="text-xs sm:text-sm font-semibold text-stone-800 text-right">{value || '—'}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Exchange Rate Note */}
                                {/* <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-2">
                                  <p className="text-xs text-amber-800 font-medium">
                                    Rate: 1 USD = {exchangeRate.toLocaleString()} UGX
                                  </p>
                                  <p className="text-xs text-amber-700 mt-0.5">Rate subject to change without notice.</p>
                                </div> */}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Policies */}
                        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                          {[['Payment Policy', 'payment'], ['Cancellation Policy', 'cancellation'], ['Rate Policy', 'rate']].map(([title, key]) => (
                            <div key={key} className="border-2 border-stone-300 rounded-md p-3 sm:p-4 bg-stone-50 page-break-avoid">
                              <h3 className="font-bold text-stone-900 mb-2 uppercase tracking-wide text-xs sm:text-sm pb-2 border-b-2 border-amber-500">{title}</h3>
                              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{policies[key]}</p>
                          </div>
                          ))}
                        </div>

                        {/* Signature */}
                        <div className="border-t-2 border-stone-300 pt-4 sm:pt-6 page-break-avoid">
                        <div className="text-right">
                            <p className="font-bold text-stone-900 text-base sm:text-lg">PAUL EDRINE BASULE</p>
                            <p className="text-xs sm:text-sm text-stone-600 uppercase tracking-wide">Director</p>
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