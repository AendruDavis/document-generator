import React, { useState } from 'react';
import { Download, FileText, Plus, Trash2, Building2 } from 'lucide-react';

const InvoiceGenerator = () => {
  const [documentType, setDocumentType] = useState('quotation');
  const [currency, setCurrency] = useState('UGX');
  const [exchangeRate] = useState(3700);
  
  const [companyInfo, setCompanyInfo] = useState({
    name: 'GALENE HOLIDAYS AFRICA',
    tagline: 'CRAFTING UNIQUE SAFARIS',
    phone: '+256 701 608674',
    email: 'basuleedrine@gmail.com',
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

  const calculateTotal = () => {
    const subtotal = lineItems.reduce((sum, item) => {
      const itemTotal = item.price * (item.qty || 1);
      return sum + itemTotal;
    }, 0);
    
    const taxAmount = subtotal * (additionalCosts.tax / 100);
    const companyShareAmount = (subtotal + taxAmount) * (additionalCosts.companyShare / 100);
    const total = subtotal + taxAmount + companyShareAmount;
    
    return { subtotal, taxAmount, companyShareAmount, total };
  };

  const formatCurrency = (amount) => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    } else {
      const ugxAmount = amount * exchangeRate;
      return `UGX ${ugxAmount.toLocaleString()}`;
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', price: 0, qty: 1, unit: 'pax' }]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = field === 'price' || field === 'qty' ? parseFloat(value) || 0 : value;
    setLineItems(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation Bar - Hidden in print */}
      <div className="print:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-md flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Professional Documents</h1>
                <p className="text-xs text-emerald-100">Invoice & Letter Generator</p>
              </div>
            </div>
            
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 print:pt-0 pb-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Sidebar Controls - Hidden in print */}
            <div className="lg:col-span-2 print:hidden space-y-6">
              {/* Document Type Selector */}
              <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
                <label className="block text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">Document Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['quotation', 'invoice', 'receipt', 'letter'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setDocumentType(type)}
                      className={`px-4 py-3 rounded-md text-sm font-semibold transition-all ${
                        documentType === type
                          ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Selector */}
              {documentType !== 'letter' && (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
                  <label className="block text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">Currency</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrency('USD')}
                      className={`flex-1 px-4 py-3 rounded-md text-sm font-semibold transition-all ${
                        currency === 'USD'
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      USD ($)
                    </button>
                    <button
                      onClick={() => setCurrency('UGX')}
                      className={`flex-1 px-4 py-3 rounded-md text-sm font-semibold transition-all ${
                        currency === 'UGX'
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      UGX
                    </button>
                  </div>
                </div>
              )}

              {/* Company Information */}
              <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
                <h2 className="text-sm font-bold text-stone-800 mb-4 uppercase tracking-wider">Company Information</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    className="w-full px-4 py-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Tagline"
                    value={companyInfo.tagline}
                    onChange={(e) => setCompanyInfo({...companyInfo, tagline: e.target.value})}
                    className="w-full px-4 py-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    className="w-full px-4 py-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Website"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                    className="w-full px-4 py-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
                <h2 className="text-sm font-bold text-stone-800 mb-4 uppercase tracking-wider">Client Information</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                    className="w-full px-4 py-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Client Phone"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Client Email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                    className="w-full px-4 py-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              {documentType === 'letter' ? (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
                  <h2 className="text-sm font-bold text-stone-800 mb-4 uppercase tracking-wider">Letter Content</h2>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={letterContent.subject}
                      onChange={(e) => setLetterContent({...letterContent, subject: e.target.value})}
                      className="w-full px-4 py-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm"
                    />
                    <textarea
                      placeholder="Letter Body"
                      value={letterContent.body}
                      onChange={(e) => setLetterContent({...letterContent, body: e.target.value})}
                      rows={10}
                      className="w-full px-4 py-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm"
                    />
                    <textarea
                      placeholder="Closing"
                      value={letterContent.closing}
                      onChange={(e) => setLetterContent({...letterContent, closing: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Line Items</h2>
                      <button
                        onClick={addLineItem}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-all text-sm font-semibold shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                    <div className="space-y-3">
                      {lineItems.map((item, index) => (
                        <div key={index} className="bg-stone-50 p-4 rounded-md border border-stone-200">
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="number"
                                placeholder="Price"
                                value={item.price}
                                onChange={(e) => updateLineItem(index, 'price', e.target.value)}
                                className="px-3 py-2 border border-stone-300 rounded-md text-sm"
                              />
                              <input
                                type="number"
                                placeholder="Qty"
                                value={item.qty}
                                onChange={(e) => updateLineItem(index, 'qty', e.target.value)}
                                className="px-3 py-2 border border-stone-300 rounded-md text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Unit"
                                value={item.unit}
                                onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                                className="px-3 py-2 border border-stone-300 rounded-md text-sm"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeLineItem(index)}
                            className="mt-2 p-2 text-red-600 hover:bg-red-50 rounded-md transition-all w-full flex items-center justify-center gap-2 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
                    <h2 className="text-sm font-bold text-stone-800 mb-4 uppercase tracking-wider">Additional Costs</h2>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="flex-1 text-sm font-medium text-stone-700">Tax (%)</label>
                        <input
                          type="number"
                          value={additionalCosts.tax}
                          onChange={(e) => setAdditionalCosts({...additionalCosts, tax: parseFloat(e.target.value) || 0})}
                          className="w-24 px-3 py-2 border border-stone-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 text-sm font-medium text-stone-700">Company Share (%)</label>
                        <input
                          type="number"
                          value={additionalCosts.companyShare}
                          onChange={(e) => setAdditionalCosts({...additionalCosts, companyShare: parseFloat(e.target.value) || 0})}
                          className="w-24 px-3 py-2 border border-stone-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Document Preview */}
            <div className="lg:col-span-3 print:col-span-full">
              <div className="bg-white shadow-xl border border-stone-200 overflow-hidden print:shadow-none print:border-0">
                {documentType === 'letter' ? (
                  // Letter Template
                  <div className="p-16 print:p-20">
                    {/* Letterhead */}
                    <div className="border-b-4 border-amber-500 pb-8 mb-12">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-1">{companyInfo.name}</h1>
                          <p className="text-sm text-emerald-800 uppercase tracking-widest font-semibold">{companyInfo.tagline}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-700 to-teal-700 rounded-md"></div>
                      </div>
                      <div className="mt-6 text-sm text-stone-700 space-y-1">
                        <p className="font-medium">{companyInfo.phone}</p>
                        <p className="text-emerald-800 font-medium">{companyInfo.email}</p>
                        <p className="text-emerald-800 font-medium">{companyInfo.website}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mb-10">
                      <p className="text-sm text-stone-600 font-medium">
                        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    {/* Recipient */}
                    <div className="mb-10">
                      <p className="font-bold text-stone-900 text-lg mb-2">{clientInfo.name}</p>
                      <p className="text-sm text-stone-600">{clientInfo.email}</p>
                      <p className="text-sm text-stone-600">{clientInfo.phone}</p>
                    </div>

                    {/* Subject */}
                    <div className="mb-8 pb-4 border-b border-stone-200">
                      <p className="font-bold text-stone-900">
                        <span className="text-stone-600">Re:</span> {letterContent.subject}
                      </p>
                    </div>

                    {/* Body */}
                    <div className="mb-16 whitespace-pre-wrap text-stone-700 leading-relaxed">
                      {letterContent.body}
                    </div>

                    {/* Closing */}
                    <div className="whitespace-pre-wrap text-stone-700 leading-relaxed">
                      {letterContent.closing}
                    </div>
                  </div>
                ) : (
                  // Invoice/Receipt/Quotation Template
                  <div>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white p-10 print:p-12">
                      <div className="flex justify-between items-start gap-8">
                        <div className="flex-1">
                          <h1 className="text-4xl font-bold tracking-tight mb-2">{companyInfo.name}</h1>
                          <p className="text-sm uppercase tracking-widest text-emerald-100 font-semibold mb-6">
                            {companyInfo.tagline}
                          </p>
                          <div className="space-y-1 text-sm text-emerald-50">
                            <p>{companyInfo.phone}</p>
                            <p>{companyInfo.email}</p>
                            <p className="font-semibold">{companyInfo.website}</p>
                          </div>
                        </div>
                        <div className="text-right bg-black/20 backdrop-blur-sm px-6 py-4 rounded-md border border-white/20">
                          <p className="text-xs uppercase tracking-wider text-emerald-100 mb-2">Bill To</p>
                          <p className="font-bold text-lg mb-3">{clientInfo.name}</p>
                          <div className="text-sm space-y-1 text-emerald-50">
                            <p>{clientInfo.phone}</p>
                            <p>{clientInfo.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document Title Bar */}
                    <div className="bg-stone-900 text-white py-5 px-10 print:px-12">
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold uppercase tracking-wider">
                          {documentType}
                        </h2>
                        <div className="text-right">
                          <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Document Number</p>
                          <p className="font-bold text-lg text-amber-400">{documentDetails.number}</p>
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="p-10 print:p-12">
                      <div className="border-2 border-stone-200 rounded-md overflow-hidden mb-8">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-stone-100 border-b-2 border-stone-300">
                              <th className="text-left py-4 px-6 font-bold text-sm text-stone-800 uppercase tracking-wide">Description</th>
                              <th className="text-right py-4 px-6 font-bold text-sm text-stone-800 uppercase tracking-wide">Price</th>
                              <th className="text-center py-4 px-6 font-bold text-sm text-stone-800 uppercase tracking-wide">Quantity</th>
                              <th className="text-right py-4 px-6 font-bold text-sm text-stone-800 uppercase tracking-wide">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lineItems.map((item, index) => (
                              <tr key={index} className="border-b border-stone-200 hover:bg-stone-50 transition-colors">
                                <td className="py-4 px-6 text-stone-800 font-medium">{item.description}</td>
                                <td className="py-4 px-6 text-right text-stone-700">
                                  {currency === 'USD' ? `$${item.price.toFixed(2)}` : `${item.price.toFixed(2)}`}
                                </td>
                                <td className="py-4 px-6 text-center text-stone-700">
                                  {item.qty} <span className="text-xs text-stone-500 uppercase">{item.unit}</span>
                                </td>
                                <td className="py-4 px-6 text-right font-bold text-stone-900">
                                  {formatCurrency(item.price * item.qty)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals Section */}
                      <div className="space-y-3 mb-10">
                        <div className="bg-stone-100 border-2 border-stone-300 rounded-md py-4 px-6 flex justify-between items-center">
                          <span className="font-bold text-stone-800 uppercase tracking-wide text-sm">Subtotal</span>
                          <span className="text-xl font-bold text-stone-900">{formatCurrency(totals.subtotal)}</span>
                        </div>

                        <div className="border-2 border-stone-200 rounded-md py-4 px-6 flex justify-between items-center">
                          <span className="text-stone-700 text-sm">
                            Value Added Tax <span className="font-semibold">({additionalCosts.tax}%)</span>
                          </span>
                          <span className="text-lg font-bold text-emerald-700">{formatCurrency(totals.taxAmount)}</span>
                        </div>

                        <div className="border-2 border-stone-200 rounded-md py-4 px-6 flex justify-between items-center">
                          <span className="text-stone-700 text-sm">
                            Company Share <span className="font-semibold">({additionalCosts.companyShare}%)</span>
                          </span>
                          <span className="text-lg font-bold text-emerald-700">{formatCurrency(totals.companyShareAmount)}</span>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-md py-5 px-6 flex justify-between items-center shadow-lg">
                          <span className="font-bold text-white text-lg uppercase tracking-wide">Total Amount</span>
                          <span className="text-3xl font-bold text-amber-300">{formatCurrency(totals.total)}</span>
                        </div>
                      </div>

                      {/* Policies */}
                      <div className="space-y-6 mb-10">
                        <div className="border-2 border-stone-300 rounded-md p-6 bg-stone-50">
                          <h3 className="font-bold text-stone-900 mb-3 uppercase tracking-wide text-sm pb-2 border-b-2 border-amber-500">
                            Payment Policy
                          </h3>
                          <p className="text-sm text-stone-700 leading-relaxed">{policies.payment}</p>
                        </div>

                        <div className="border-2 border-stone-300 rounded-md p-6 bg-stone-50">
                          <h3 className="font-bold text-stone-900 mb-3 uppercase tracking-wide text-sm pb-2 border-b-2 border-amber-500">
                            Cancellation Policy
                          </h3>
                          <p className="text-sm text-stone-700 leading-relaxed">{policies.cancellation}</p>
                        </div>

                        <div className="border-2 border-stone-300 rounded-md p-6 bg-stone-50">
                          <h3 className="font-bold text-stone-900 mb-3 uppercase tracking-wide text-sm pb-2 border-b-2 border-amber-500">
                            Rate Policy
                          </h3>
                          <p className="text-sm text-stone-700 leading-relaxed">{policies.rate}</p>
                        </div>
                      </div>

                      {/* Signature */}
                      <div className="border-t-2 border-stone-300 pt-8">
                        <div className="text-right">
                          <p className="font-bold text-stone-900 text-lg">PAUL EDRINE BASULE</p>
                          <p className="text-sm text-stone-600 uppercase tracking-wide">Director</p>
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

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          @page {
            margin: 1cm;
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

export default InvoiceGenerator;