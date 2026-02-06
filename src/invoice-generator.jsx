import React, { useState, useEffect } from 'react';
import { Download, FileText, Receipt, Mail, Plus, Trash2, DollarSign } from 'lucide-react';

const InvoiceGenerator = () => {
  const [documentType, setDocumentType] = useState('quotation');
  const [currency, setCurrency] = useState('UGX');
  const [exchangeRate] = useState(3700); // UGX to USD approximate rate
  
  const [companyInfo, setCompanyInfo] = useState({
    name: 'GAËNE HOLIDAYS AFRICA',
    tagline: 'CRAFTING UNIQUE SAFARIS',
    phone: '+256 701 608674',
    email: 'basudeedris@gmail.com',
    website: 'www.gaeneholidaysafrica.com',
    address: 'Kampala, Uganda'
  });

  const [clientInfo, setClientInfo] = useState({
    name: 'MR THIAGO SILVA-SOARES',
    phone: '+55 21 99665-2206',
    email: 'thiagosilvasoares94@gmail.com'
  });

  const [documentDetails, setDocumentDetails] = useState({
    number: 'INV-001',
    date: new Date().toISOString().split('T')[0]
  });

  const [lineItems, setLineItems] = useState([
    { description: 'Gorilla permit', price: 800, qty: 7, unit: 'pax' },
    { description: 'Chimpanzee permit', price: 250, qty: 7, unit: 'pax' }
  ]);

  const [additionalCosts, setAdditionalCosts] = useState({
    tax: 18,
    companyShare: 10
  });

  const [policies, setPolicies] = useState({
    payment: 'A payment of 100% on given permits is required on confirmation of your booking.',
    cancellation: 'Cancelled bookings forfeit 30% deposit if cancelled 60 days of arrival.',
    rate: 'All rates are in US DOLLARS and a separate table of the government taxes and services charge.'
  });

  // Letter-specific state
  const [letterContent, setLetterContent] = useState({
    subject: 'Business Proposal',
    body: 'Dear Sir/Madam,\n\nWe are writing to...',
    closing: 'Sincerely,\nPaul Edrine Basude\nDirector'
  });

  // Calculate totals
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Controls - Hidden in print */}
      <div className="print:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-800">Document Generator</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Document Type Selector */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                {['quotation', 'invoice', 'receipt', 'letter'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setDocumentType(type)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      documentType === type
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {/* Currency Selector */}
              {documentType !== 'letter' && (
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      currency === 'USD'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setCurrency('UGX')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      currency === 'UGX'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    UGX
                  </button>
                </div>
              )}

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Print/Save PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form - Hidden in print */}
          <div className="print:hidden space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Company Information</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Tagline"
                  value={companyInfo.tagline}
                  onChange={(e) => setCompanyInfo({...companyInfo, tagline: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Website"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Client Information</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Client Name"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Client Phone"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Client Email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {documentType === 'letter' ? (
              <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Letter Content</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={letterContent.subject}
                    onChange={(e) => setLetterContent({...letterContent, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Letter Body"
                    value={letterContent.body}
                    onChange={(e) => setLetterContent({...letterContent, body: e.target.value})}
                    rows={10}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Closing"
                    value={letterContent.closing}
                    onChange={(e) => setLetterContent({...letterContent, closing: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Line Items</h2>
                    <button
                      onClick={addLineItem}
                      className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {lineItems.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center bg-slate-50 p-3 rounded-lg">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => updateLineItem(index, 'price', e.target.value)}
                          className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.qty}
                          onChange={(e) => updateLineItem(index, 'qty', e.target.value)}
                          className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Unit"
                          value={item.unit}
                          onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                          className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => removeLineItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">Additional Costs</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="flex-1 text-sm font-medium text-slate-700">Tax (%)</label>
                      <input
                        type="number"
                        value={additionalCosts.tax}
                        onChange={(e) => setAdditionalCosts({...additionalCosts, tax: parseFloat(e.target.value) || 0})}
                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 text-sm font-medium text-slate-700">Company Share (%)</label>
                      <input
                        type="number"
                        value={additionalCosts.companyShare}
                        onChange={(e) => setAdditionalCosts({...additionalCosts, companyShare: parseFloat(e.target.value) || 0})}
                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Document Preview */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
              {documentType === 'letter' ? (
                // Letter Template
                <div className="p-12 print:p-16">
                  {/* Letterhead */}
                  <div className="border-b-4 border-pink-400 pb-6 mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{companyInfo.name}</h1>
                    <p className="text-sm text-slate-600 mt-1">{companyInfo.tagline}</p>
                    <div className="mt-3 text-sm text-slate-600 space-y-1">
                      <p>{companyInfo.phone}</p>
                      <p className="text-pink-600">{companyInfo.email}</p>
                      <p className="text-pink-600">{companyInfo.website}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mb-8">
                    <p className="text-sm text-slate-600">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>

                  {/* Recipient */}
                  <div className="mb-8">
                    <p className="font-semibold text-slate-800">{clientInfo.name}</p>
                    <p className="text-sm text-slate-600">{clientInfo.email}</p>
                  </div>

                  {/* Subject */}
                  <div className="mb-6">
                    <p className="font-bold text-slate-800">Re: {letterContent.subject}</p>
                  </div>

                  {/* Body */}
                  <div className="mb-12 whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {letterContent.body}
                  </div>

                  {/* Closing */}
                  <div className="whitespace-pre-wrap text-slate-700">
                    {letterContent.closing}
                  </div>

                  {/* Footer */}
                  <div className="mt-16 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{companyInfo.name}</span>
                      <span>{companyInfo.phone}</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Invoice/Receipt/Quotation Template
                <div>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white p-8">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="bg-slate-800 text-white px-4 py-2 inline-block text-xs font-bold mb-3">
                          Invoice To:
                        </div>
                        <div className="mt-2">
                          <h3 className="font-bold text-lg">{clientInfo.name}</h3>
                          <p className="text-sm mt-1">{clientInfo.phone}</p>
                          <p className="text-sm">{clientInfo.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <h1 className="text-4xl font-bold mb-2">{companyInfo.name}</h1>
                        <p className="text-xs uppercase tracking-wide mb-3">{companyInfo.tagline}</p>
                        <p className="text-sm">{companyInfo.phone}</p>
                        <p className="text-sm">{companyInfo.email}</p>
                        <p className="text-sm font-semibold">{companyInfo.website}</p>
                      </div>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center py-4 bg-white border-b-2 border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                      PRICE {documentType.toUpperCase()}
                    </h2>
                  </div>

                  {/* Items Table */}
                  <div className="p-8">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          <th className="text-left py-3 px-4 font-semibold text-sm">DESCRIPTION</th>
                          <th className="text-right py-3 px-4 font-semibold text-sm">PRICE</th>
                          <th className="text-center py-3 px-4 font-semibold text-sm">QTY</th>
                          <th className="text-right py-3 px-4 font-semibold text-sm">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {lineItems.map((item, index) => (
                          <tr key={index} className="border-b border-slate-200">
                            <td className="py-4 px-4 text-slate-700">{item.description}</td>
                            <td className="py-4 px-4 text-right text-slate-700">
                              {currency === 'USD' ? `$${item.price.toFixed(2)}` : `${item.price.toFixed(2)}`}
                            </td>
                            <td className="py-4 px-4 text-center text-slate-700">
                              {item.qty} {item.unit}
                            </td>
                            <td className="py-4 px-4 text-right font-semibold text-slate-800">
                              {formatCurrency(item.price * item.qty)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals Section */}
                    <div className="mt-8 space-y-3">
                      <div className="bg-slate-800 text-white py-3 px-6 flex justify-between items-center">
                        <span className="font-semibold">SUB TOTAL:</span>
                        <span className="text-lg font-bold">{formatCurrency(totals.subtotal)}</span>
                      </div>

                      <div className="border-2 border-slate-300 py-3 px-6 flex justify-between items-center">
                        <span className="text-slate-700">Value Added Tax ({additionalCosts.tax}% of the total cost)</span>
                        <span className="text-pink-600 font-bold">{formatCurrency(totals.taxAmount)}</span>
                      </div>

                      <div className="border-2 border-slate-300 py-3 px-6 flex justify-between items-center">
                        <span className="text-slate-700">{additionalCosts.companyShare}% of the company share</span>
                        <span className="text-pink-600 font-bold">{formatCurrency(totals.companyShareAmount)}</span>
                      </div>

                      <div className="bg-slate-800 text-white py-4 px-6 flex justify-between items-center">
                        <span className="font-bold text-lg">TOTAL AMOUNT</span>
                        <span className="text-2xl font-bold text-green-400">{formatCurrency(totals.total)}</span>
                      </div>
                    </div>

                    {/* Policies */}
                    <div className="mt-12 space-y-6">
                      <div className="border-2 border-slate-300 p-6">
                        <h3 className="font-bold text-slate-800 mb-3 text-center">PAYMENT POLICY</h3>
                        <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside">
                          <li>{policies.payment}</li>
                        </ul>
                      </div>

                      <div className="border-2 border-slate-300 p-6">
                        <h3 className="font-bold text-slate-800 mb-3 text-center">CANCELLATION POLICY</h3>
                        <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside">
                          <li>{policies.cancellation}</li>
                        </ul>
                      </div>

                      <div className="border-2 border-slate-300 p-6">
                        <h3 className="font-bold text-slate-800 mb-3 text-center">RATE POLICY</h3>
                        <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside">
                          <li>{policies.rate}</li>
                        </ul>
                      </div>
                    </div>

                    {/* Signature */}
                    <div className="mt-12 text-right">
                      <p className="font-bold text-slate-800">PAUL EDRINE BASUDE</p>
                      <p className="text-sm text-slate-600">Director</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t-2 border-slate-200 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span>{companyInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Receipt className="w-4 h-4" />
                        <span>{companyInfo.website}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span>{companyInfo.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            margin: 0.5cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceGenerator;
