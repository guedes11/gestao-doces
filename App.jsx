import React, { useState, useEffect, useRef } from 'react';
import { Candy, Users, LayoutDashboard, Plus, Trash2, Store, ShoppingCart, X, ChevronDown, ChevronUp, Phone, Wallet, CheckCircle2, Receipt, Edit2, History, Download, Upload, AlertCircle } from 'lucide-react';

export default function App() {
  // --- ESTADOS DOS DADOS (Local Storage) ---
  const [clientes, setClientes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gestao_doces_clientes')) || []; } catch (e) { return []; }
  });
  const [doces, setDoces] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gestao_doces_produtos')) || []; } catch (e) { return []; }
  });
  const [vendas, setVendas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gestao_doces_vendas')) || []; } catch (e) { return []; }
  });
  const [pagamentos, setPagamentos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gestao_doces_pagamentos')) || []; } catch (e) { return []; }
  });
  const [logsPagamentos, setLogsPagamentos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gestao_doces_logs')) || []; } catch (e) { return []; }
  });

  // --- SINCRONIZAÇÃO AUTOMÁTICA COM O LOCALSTORAGE ---
  useEffect(() => { localStorage.setItem('gestao_doces_clientes', JSON.stringify(clientes)); }, [clientes]);
  useEffect(() => { localStorage.setItem('gestao_doces_produtos', JSON.stringify(doces)); }, [doces]);
  useEffect(() => { localStorage.setItem('gestao_doces_vendas', JSON.stringify(vendas)); }, [vendas]);
  useEffect(() => { localStorage.setItem('gestao_doces_pagamentos', JSON.stringify(pagamentos)); }, [pagamentos]);
  useEffect(() => { localStorage.setItem('gestao_doces_logs', JSON.stringify(logsPagamentos)); }, [logsPagamentos]);

  // --- ESTADOS DA INTERFACE ---
  const [abaAtiva, setAbaAtiva] = useState('resumo'); 
  const [modalVenda, setModalVenda] = useState({ aberto: false, clienteId: null, clienteNome: '' });
  const [doceSelecionado, setDoceSelecionado] = useState('');
  const [erroVenda, setErroVenda] = useState('');
  const [modalPagamento, setModalPagamento] = useState({ aberto: false, clienteId: null, clienteNome: '', totalDevido: 0 });
  const [valorPagamento, setValorPagamento] = useState('');
  const [modalEditaCliente, setModalEditaCliente] = useState({ aberto: false, cliente: null });
  const [modalEditaDoce, setModalEditaDoce] = useState({ aberto: false, doce: null });
  const [clientesExpandidos, setClientesExpandidos] = useState([]);
  
  const [novoCliente, setNovoCliente] = useState({ nome: '', departamento: '', whatsapp: '' });
  const [novoDoce, setNovoDoce] = useState({ nome: '', preco: '', estoque: '' });

  const fileInputRef = useRef(null);

  // --- FUNÇÕES DE BACKUP (EXPORTAR / IMPORTAR) ---
  const exportarDados = () => {
    const dados = { clientes, doces, vendas, pagamentos, logsPagamentos };
    const blob = new Blob([JSON.stringify(dados)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_doces_${new Date().toLocaleDateString('pt-PT').replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importarDados = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target.result);
        if (dados.clientes && dados.doces) {
          if (window.confirm("Atenção: Isto irá substituir os dados atuais pelos do backup. Deseja continuar?")) {
            setClientes(dados.clientes || []);
            setDoces(dados.doces || []);
            setVendas(dados.vendas || []);
            setPagamentos(dados.pagamentos || []);
            setLogsPagamentos(dados.logsPagamentos || []);
            alert("Dados restaurados com sucesso!");
          }
        } else {
          alert("Ficheiro de backup inválido.");
        }
      } catch (error) {
        alert("Erro ao ler o ficheiro. Certifique-se de que é o ficheiro correto.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  // --- FUNÇÕES CRUD ---
  const gerarId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

  // Clientes
  const adicionarCliente = (e) => {
    e.preventDefault();
    if (!novoCliente.nome || !novoCliente.departamento) return;
    const cliente = { ...novoCliente, id: gerarId() };
    setClientes([...clientes, cliente]);
    setNovoCliente({ nome: '', departamento: '', whatsapp: '' });
  };

  const atualizarCliente = (e) => {
    e.preventDefault();
    if (!modalEditaCliente.cliente) return;
    setClientes(clientes.map(c => c.id === modalEditaCliente.cliente.id ? modalEditaCliente.cliente : c));
    setModalEditaCliente({ aberto: false, cliente: null });
  };

  const removerCliente = (id) => {
    if (window.confirm('Eliminar cliente e todo o seu histórico de dívidas?')) {
      setClientes(clientes.filter(c => c.id !== id));
      setVendas(vendas.filter(v => v.clienteId !== id));
      setPagamentos(pagamentos.filter(p => p.clienteId !== id));
    }
  };

  const toggleExpandirCliente = (id) => {
    setClientesExpandidos(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // Doces
  const adicionarDoce = (e) => {
    e.preventDefault();
    if (!novoDoce.nome || !novoDoce.preco || !novoDoce.estoque) return;
    const precoFormatado = parseFloat(novoDoce.preco.replace(',', '.'));
    const estoqueFormatado = parseInt(novoDoce.estoque, 10);
    if (isNaN(precoFormatado) || isNaN(estoqueFormatado)) return;
    
    setDoces([...doces, { id: gerarId(), nome: novoDoce.nome, preco: precoFormatado, estoque: estoqueFormatado }]);
    setNovoDoce({ nome: '', preco: '', estoque: '' });
  };

  const atualizarDoce = (e) => {
    e.preventDefault();
    if (!modalEditaDoce.doce) return;
    const precoFormatado = typeof modalEditaDoce.doce.preco === 'string' ? parseFloat(modalEditaDoce.doce.preco.replace(',', '.')) : modalEditaDoce.doce.preco;
    const estoqueFormatado = parseInt(modalEditaDoce.doce.estoque, 10);
    if (isNaN(precoFormatado) || isNaN(estoqueFormatado)) return;
    
    setDoces(doces.map(d => d.id === modalEditaDoce.doce.id ? { ...modalEditaDoce.doce, preco: precoFormatado, estoque: estoqueFormatado } : d));
    setModalEditaDoce({ aberto: false, doce: null });
  };

  const removerDoce = (id) => {
    if (window.confirm('Deseja eliminar este produto do catálogo?')) {
      setDoces(doces.filter(d => d.id !== id));
    }
  };

  // Vendas
  const registrarVenda = (e) => {
    e.preventDefault();
    setErroVenda('');
    if (!doceSelecionado) return;
    const doce = doces.find(d => d.id === doceSelecionado);
    if (!doce) return;
    if (doce.estoque <= 0) { setErroVenda("Produto esgotado."); return; }

    setDoces(doces.map(d => d.id === doce.id ? { ...d, estoque: d.estoque - 1 } : d));
    
    const novaVenda = {
      id: gerarId(), clienteId: modalVenda.clienteId, doceId: doce.id, doceNome: doce.nome, preco: doce.preco,
      data: new Date().toLocaleDateString('pt-PT'), timestamp: Date.now() 
    };
    setVendas([...vendas, novaVenda]);

    setModalVenda({ aberto: false, clienteId: null, clienteNome: '' });
    setDoceSelecionado('');
    if (!clientesExpandidos.includes(modalVenda.clienteId)) setClientesExpandidos([...clientesExpandidos, modalVenda.clienteId]);
  };

  const removerVenda = (vendaId, doceId) => {
    if (window.confirm("Cancelar venda e repor a unidade no estoque?")) {
      setVendas(vendas.filter(v => v.id !== vendaId));
      if (doceId && doceId !== 'pagamento') {
        setDoces(doces.map(d => d.id === doceId ? { ...d, estoque: d.estoque + 1 } : d));
      }
    }
  };

  // Pagamentos
  const confirmarPagamento = (e) => {
    e.preventDefault();
    if (!modalPagamento.clienteId) return;
    const valorFormatado = parseFloat(valorPagamento.toString().replace(',', '.'));
    if (isNaN(valorFormatado) || valorFormatado <= 0) return;

    const novoLog = {
      id: gerarId(), clienteId: modalPagamento.clienteId, clienteNome: modalPagamento.clienteNome, valor: valorFormatado,
      data: new Date().toLocaleDateString('pt-PT'), hora: new Date().toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'}), timestamp: Date.now()
    };
    setLogsPagamentos([...logsPagamentos, novoLog]);

    if (valorFormatado >= modalPagamento.totalDevido - 0.01) {
      setVendas(vendas.filter(v => v.clienteId !== modalPagamento.clienteId));
      setPagamentos(pagamentos.filter(p => p.clienteId !== modalPagamento.clienteId));
    } else {
      const novoPagamento = {
        id: gerarId(), clienteId: modalPagamento.clienteId, valor: valorFormatado, data: new Date().toLocaleDateString('pt-PT'), timestamp: Date.now()
      };
      setPagamentos([...pagamentos, novoPagamento]);
    }
    setModalPagamento({ aberto: false, clienteId: null, clienteNome: '', totalDevido: 0 });
    setValorPagamento('');
  };

  const removerLogPagamento = (logId) => {
    if (window.confirm("Eliminar registo do caixa? (O saldo do cliente não será alterado)")) {
      setLogsPagamentos(logsPagamentos.filter(l => l.id !== logId));
    }
  };

  const abrirWhatsapp = (e, numero) => {
    e.stopPropagation();
    if (!numero) return;
    let numeroLimpo = numero.replace(/\D/g, ''); 
    if (numeroLimpo.length <= 11) numeroLimpo = '351' + numeroLimpo; // Indicativo padrão para PT, pode alterar se for BR (55)
    window.open(`https://wa.me/${numeroLimpo}`, '_blank', 'noopener,noreferrer');
  };

  // --- RENDERIZADORES DE ABAS ---

  const renderResumo = () => {
    const clientesOrdenados = [...clientes].sort((a, b) => a.nome.localeCompare(b.nome));

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white flex items-center space-x-4 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-600 rounded-full opacity-20 blur-2xl"></div>
          <div className="p-3 bg-white/10 rounded-xl text-indigo-300 backdrop-blur-sm"><Store size={28} /></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold tracking-wide">Painel de Vendas</h2>
            <p className="text-indigo-200 text-sm font-medium">Acompanhamento ativo</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 px-1 flex items-center">
            <Users size={16} className="mr-2 text-indigo-600"/> Contas de Clientes
          </h3>
          
          {clientesOrdenados.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center text-sm text-slate-500 font-medium">
              Nenhum cliente registado. Aceda à aba "Clientes".
            </div>
          ) : (
            <div className="space-y-3">
              {clientesOrdenados.map(cliente => {
                const comprasDoCliente = vendas.filter(v => v.clienteId === cliente.id).sort((a, b) => b.timestamp - a.timestamp);
                const pagamentosDoCliente = pagamentos.filter(p => p.clienteId === cliente.id).sort((a, b) => b.timestamp - a.timestamp);
                
                const totalComprado = comprasDoCliente.reduce((acc, curr) => acc + curr.preco, 0);
                const totalPago = pagamentosDoCliente.reduce((acc, curr) => acc + curr.valor, 0);
                const saldoDevido = totalComprado - totalPago;
                const estaExpandido = clientesExpandidos.includes(cliente.id);

                return (
                  <div key={cliente.id} className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all overflow-hidden hover:border-indigo-300 hover:shadow-md">
                    <div className="p-4 flex justify-between items-center cursor-pointer active:bg-slate-50 transition-colors" onClick={() => toggleExpandirCliente(cliente.id)}>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-bold text-slate-900 mr-2 text-lg">{cliente.nome}</h4>
                          {estaExpandido ? <ChevronUp size={18} className="text-indigo-600" /> : <ChevronDown size={18} className="text-slate-400" />}
                        </div>
                        <div className="flex items-center space-x-3 mt-1.5">
                          <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium border border-slate-200">{cliente.departamento}</span>
                          {!estaExpandido && saldoDevido > 0 && (
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center border border-red-100">€ {saldoDevido.toFixed(2).replace('.', ',')}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {cliente.whatsapp && (
                          <button type="button" onClick={(e) => abrirWhatsapp(e, cliente.whatsapp)} className="text-emerald-600 p-2 rounded-lg hover:bg-emerald-50 transition-colors focus:outline-none border border-transparent hover:border-emerald-200" title="Contactar no WhatsApp">
                            <Phone size={20} />
                          </button>
                        )}
                        {estaExpandido && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); setModalVenda({ aberto: true, clienteId: cliente.id, clienteNome: cliente.nome }); setErroVenda(''); }} className="bg-indigo-50 text-indigo-700 p-2.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center active:scale-95 border border-indigo-200" title="Registar nova venda">
                            <ShoppingCart size={20} className="mr-1" /><span className="text-xs font-bold">Vender</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {estaExpandido && (
                      <div className="bg-slate-50 p-4 border-t border-slate-200 animate-in slide-in-from-top-2 fade-in duration-200">
                        {comprasDoCliente.length > 0 ? (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              {comprasDoCliente.map(compra => (
                                <div key={compra.id} className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-2 pt-2 last:border-0 last:pb-0 group">
                                  <div className="flex flex-col flex-1">
                                    <span className="text-slate-900 font-semibold">{compra.doceNome}</span>
                                    <span className="text-slate-500 text-[11px]">{compra.data}</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className="font-bold text-slate-800">€ {compra.preco.toFixed(2).replace('.', ',')}</span>
                                    <button onClick={() => removerVenda(compra.id, compra.doceId)} className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500 rounded transition-colors active:scale-95 md:opacity-0 md:group-hover:opacity-100" title="Cancelar venda">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {pagamentosDoCliente.length > 0 && (
                              <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm mt-2">
                                <h6 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center"><Receipt size={14} className="mr-1" /> Pagamentos Parciais</h6>
                                <div className="space-y-1.5">
                                  {pagamentosDoCliente.map(pag => (
                                    <div key={pag.id} className="flex justify-between text-xs">
                                      <span className="text-slate-600 font-medium">{pag.data}</span>
                                      <span className="font-bold text-emerald-600">- € {pag.valor.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="pt-4 mt-2 border-t border-slate-300">
                              <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                  <span className="text-xs text-slate-500 font-medium">Total: <span className="text-slate-800">€ {totalComprado.toFixed(2).replace('.', ',')}</span></span>
                                  {totalPago > 0 && <span className="text-xs text-slate-500 font-medium">Pago: <span className="text-emerald-600 font-bold">€ {totalPago.toFixed(2).replace('.', ',')}</span></span>}
                                  <span className="text-sm font-semibold text-slate-800 mt-1 uppercase tracking-wide">
                                    Pendente: <span className="text-red-600 text-lg font-black ml-1">€ {saldoDevido.toFixed(2).replace('.', ',')}</span>
                                  </span>
                                </div>
                                {saldoDevido > 0 && (
                                  <button onClick={() => { setModalPagamento({ aberto: true, clienteId: cliente.id, clienteNome: cliente.nome, totalDevido: saldoDevido }); setValorPagamento(saldoDevido.toFixed(2)); }} className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all">
                                    <Wallet size={18} /><span>Receber</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 text-center py-3 font-medium">Sem dívidas ativas.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCaixa = () => {
    const logsOrdenados = [...logsPagamentos].sort((a, b) => b.timestamp - a.timestamp);
    const totalArrecadado = logsOrdenados.reduce((acc, curr) => acc + curr.valor, 0);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-8 rounded-2xl shadow-lg text-white text-center relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-white rounded-full opacity-10 blur-2xl"></div>
          <History size={32} className="mx-auto mb-3 text-emerald-100" />
          <p className="text-emerald-100 text-sm font-bold uppercase tracking-widest mb-1">Total Arrecadado</p>
          <p className="text-4xl font-black tracking-tight">€ {totalArrecadado.toFixed(2).replace('.', ',')}</p>
        </div>

        {/* SECÇÃO DE BACKUP LOCAL */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div className="flex items-center text-slate-600">
            <AlertCircle size={18} className="mr-2 text-indigo-500 flex-shrink-0" />
            <span className="text-[11px] font-medium leading-tight">Backup do sistema: guarde antes de limpar o navegador.</span>
          </div>
          <div className="flex space-x-2 ml-2">
            <button onClick={exportarDados} className="p-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors" title="Exportar Backup">
              <Download size={18} />
            </button>
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={importarDados} />
            <button onClick={() => fileInputRef.current.click()} className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors" title="Importar Backup">
              <Upload size={18} />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 px-1 flex items-center">
            <Receipt size={16} className="mr-2 text-emerald-600"/> Histórico de Entradas
          </h3>
          {logsOrdenados.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center text-sm text-slate-500 font-medium">
              Nenhum pagamento recebido.
            </div>
          ) : (
            <div className="space-y-3">
              {logsOrdenados.map(log => (
                <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-emerald-300 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-base">{log.clienteNome}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{log.data} às {log.hora || '--:--'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-emerald-600 text-lg">+ € {log.valor.toFixed(2).replace('.', ',')}</span>
                    <button onClick={() => removerLogPagamento(log.id)} className="p-1.5 text-slate-300 hover:text-white hover:bg-red-500 rounded transition-colors md:opacity-0 md:group-hover:opacity-100" title="Apagar registo">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderClientes = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center border-b border-slate-100 pb-3">
          <Users className="mr-2 text-indigo-600" size={20} /> Novo Cliente
        </h2>
        <form onSubmit={adicionarCliente} className="space-y-4">
          <input type="text" placeholder="Nome *" required className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-800" value={novoCliente.nome} onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})} />
          <input type="text" placeholder="Departamento *" required className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-800" value={novoCliente.departamento} onChange={(e) => setNovoCliente({...novoCliente, departamento: e.target.value})} />
          <input type="tel" placeholder="WhatsApp (opcional)" className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-800" value={novoCliente.whatsapp} onChange={(e) => setNovoCliente({...novoCliente, whatsapp: e.target.value})} />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-xl font-bold text-sm flex justify-center items-center active:scale-95 transition-all shadow-md hover:shadow-lg">
            <Plus size={18} className="mr-2" /> Gravar Cliente
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 px-1">Diretório</h3>
        {clientes.length === 0 ? <p className="text-center text-slate-500 py-4 text-sm font-medium">Nenhum cliente registado.</p> : (
          <ul className="space-y-3">
            {clientes.map(cliente => (
              <li key={cliente.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-indigo-300 transition-colors">
                <div>
                  <p className="font-bold text-slate-900 text-base">{cliente.nome}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wide">{cliente.departamento}</p>
                  {cliente.whatsapp && <p className="text-xs text-emerald-600 font-semibold flex items-center mt-1.5"><Phone size={12} className="mr-1" /> {cliente.whatsapp}</p>}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setModalEditaCliente({ aberto: true, cliente: { ...cliente } })} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => removerCliente(cliente.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const renderDoces = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center border-b border-slate-100 pb-3">
          <Candy className="mr-2 text-indigo-600" size={20} /> Novo Produto
        </h2>
        <form onSubmit={adicionarDoce} className="space-y-4">
          <input type="text" placeholder="Nome do doce *" required className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-800" value={novoDoce.nome} onChange={(e) => setNovoDoce({...novoDoce, nome: e.target.value})} />
          <div className="flex space-x-4">
            <input type="number" step="0.01" placeholder="Preço (R$) *" required className="w-1/2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-800" value={novoDoce.preco} onChange={(e) => setNovoDoce({...novoDoce, preco: e.target.value})} />
            <input type="number" placeholder="Stock *" required className="w-1/2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-800" value={novoDoce.estoque} onChange={(e) => setNovoDoce({...novoDoce, estoque: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-xl font-bold text-sm flex justify-center items-center active:scale-95 transition-all shadow-md">
            <Plus size={18} className="mr-2" /> Gravar Produto
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 px-1">Catálogo</h3>
        {doces.length === 0 ? <p className="text-center text-slate-500 py-4 text-sm font-medium">Nenhum produto registado.</p> : (
          <ul className="space-y-3">
            {doces.map(doce => (
              <li key={doce.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-indigo-300 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${doce.estoque > 0 ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}><Candy size={24} /></div>
                  <div>
                    <p className={`font-bold text-base ${doce.estoque > 0 ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{doce.nome}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm font-bold text-slate-700">€ {doce.preco.toFixed(2).replace('.', ',')}</span>
                      <span className={`text-[10px] flex items-center font-bold px-2 py-0.5 rounded ${doce.estoque > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                        {doce.estoque > 0 ? `${doce.estoque} un.` : 'Esgotado'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setModalEditaDoce({ aberto: true, doce: { ...doce, preco: doce.preco.toString(), estoque: doce.estoque.toString() } })} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => removerDoce(doce.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 relative selection:bg-indigo-100">
      <header className="bg-white pt-8 pb-5 px-6 border-b border-slate-200 sticky top-0 z-10 shadow-sm flex justify-center items-center">
        <h1 className="text-xl font-extrabold text-indigo-700 uppercase tracking-widest text-center">
          Gestão de Doces
        </h1>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {abaAtiva === 'resumo' && renderResumo()}
        {abaAtiva === 'clientes' && renderClientes()}
        {abaAtiva === 'doces' && renderDoces()}
        {abaAtiva === 'caixa' && renderCaixa()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-around items-center p-2">
          <button onClick={() => setAbaAtiva('resumo')} className={`flex flex-col items-center p-2 transition-colors ${abaAtiva === 'resumo' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <LayoutDashboard size={24} className={abaAtiva === 'resumo' ? 'text-indigo-600' : ''} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Vendas</span>
          </button>
          <button onClick={() => setAbaAtiva('clientes')} className={`flex flex-col items-center p-2 transition-colors ${abaAtiva === 'clientes' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <Users size={24} className={abaAtiva === 'clientes' ? 'text-indigo-600' : ''} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Clientes</span>
          </button>
          <button onClick={() => setAbaAtiva('doces')} className={`flex flex-col items-center p-2 transition-colors ${abaAtiva === 'doces' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <Candy size={24} className={abaAtiva === 'doces' ? 'text-indigo-600' : ''} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Estoque</span>
          </button>
          <button onClick={() => setAbaAtiva('caixa')} className={`flex flex-col items-center p-2 transition-colors ${abaAtiva === 'caixa' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <History size={24} className={abaAtiva === 'caixa' ? 'text-emerald-600' : ''} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Caixa</span>
          </button>
        </div>
      </nav>

      {/* MODAL 1: Registo de Venda */}
      {modalVenda.aberto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center"><ShoppingCart className="mr-2 text-indigo-600" /> Nova Venda</h3>
              <button onClick={() => setModalVenda({ aberto: false, clienteId: null, clienteNome: '' })} className="text-slate-400 hover:text-slate-900 bg-slate-100 p-1.5 rounded-full focus:outline-none"><X size={20} /></button>
            </div>
            
            <form onSubmit={registrarVenda} className="space-y-5">
              <p className="text-sm font-medium text-slate-600">Cliente: <strong className="text-slate-900">{modalVenda.clienteNome}</strong></p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selecione o Produto:</label>
                {doces.length === 0 ? <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-100 font-medium">Cadastre produtos no estoque.</p> : (
                  <select className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium text-sm" value={doceSelecionado} onChange={(e) => { setDoceSelecionado(e.target.value); setErroVenda(''); }} required>
                    <option value="" disabled>Escolher doce...</option>
                    {doces.map(doce => (
                      <option key={doce.id} value={doce.id} disabled={doce.estoque <= 0}>{doce.nome} - € {doce.preco.toFixed(2).replace('.', ',')} {doce.estoque <= 0 ? ' (Esgotado)' : ` (${doce.estoque} disp.)`}</option>
                    ))}
                  </select>
                )}
              </div>
              {erroVenda && <p className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in">{erroVenda}</p>}
              <button type="submit" disabled={doces.length === 0 || !doceSelecionado} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-4 rounded-xl font-bold text-base flex justify-center items-center mt-2 transition-all shadow-md active:scale-95">Confirmar Venda</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Pagamento */}
      {modalPagamento.aberto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border-t-8 border-emerald-500">
            <div className="flex justify-between items-start mb-2">
              <div className="bg-emerald-100 text-emerald-600 w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm"><Wallet size={28} /></div>
              <button onClick={() => setModalPagamento({ aberto: false, clienteId: null, clienteNome: '', totalDevido: 0 })} className="text-slate-400 hover:text-slate-900 bg-slate-100 p-1.5 rounded-full focus:outline-none"><X size={20} /></button>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Receber Pagamento</h3>
            <p className="text-sm text-slate-500 font-medium mb-5">
              Cliente: <strong className="text-slate-800">{modalPagamento.clienteNome}</strong><br/>
              Pendente: <strong className="text-red-600 text-base">€ {modalPagamento.totalDevido.toFixed(2).replace('.', ',')}</strong>
            </p>
            <form onSubmit={confirmarPagamento}>
              <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Valor a Pagar (€):</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">€</span>
                  <input type="number" step="0.01" min="0.01" max={modalPagamento.totalDevido.toFixed(2)} required className="w-full p-3.5 pl-12 text-2xl font-black rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 shadow-sm" value={valorPagamento} onChange={(e) => setValorPagamento(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-xl font-bold text-lg flex justify-center items-center active:scale-95 transition-all shadow-md hover:shadow-lg">
                <CheckCircle2 size={22} className="mr-2" /> Confirmar Recebimento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edição Cliente */}
      {modalEditaCliente.aberto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center"><Edit2 className="mr-2 text-indigo-600" size={20}/> Editar Cliente</h3>
              <button onClick={() => setModalEditaCliente({ aberto: false, cliente: null })} className="text-slate-400 hover:text-slate-900 bg-slate-100 p-1.5 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={atualizarCliente} className="space-y-4">
              <input type="text" required className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 text-sm" value={modalEditaCliente.cliente?.nome || ''} onChange={(e) => setModalEditaCliente({...modalEditaCliente, cliente: {...modalEditaCliente.cliente, nome: e.target.value}})} />
              <input type="text" required className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 text-sm" value={modalEditaCliente.cliente?.departamento || ''} onChange={(e) => setModalEditaCliente({...modalEditaCliente, cliente: {...modalEditaCliente.cliente, departamento: e.target.value}})} />
              <input type="tel" className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 text-sm" value={modalEditaCliente.cliente?.whatsapp || ''} onChange={(e) => setModalEditaCliente({...modalEditaCliente, cliente: {...modalEditaCliente.cliente, whatsapp: e.target.value}})} />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold text-sm mt-2 shadow-md active:scale-95 transition-all">Gravar Alterações</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Edição Doce */}
      {modalEditaDoce.aberto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center"><Edit2 className="mr-2 text-indigo-600" size={20} /> Editar Produto</h3>
              <button onClick={() => setModalEditaDoce({ aberto: false, doce: null })} className="text-slate-400 hover:text-slate-900 bg-slate-100 p-1.5 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={atualizarDoce} className="space-y-4">
              <input type="text" required className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 text-sm" value={modalEditaDoce.doce?.nome || ''} onChange={(e) => setModalEditaDoce({...modalEditaDoce, doce: {...modalEditaDoce.doce, nome: e.target.value}})} />
              <div className="flex space-x-4">
                <input type="number" step="0.01" required className="w-1/2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 text-sm" value={modalEditaDoce.doce?.preco || ''} onChange={(e) => setModalEditaDoce({...modalEditaDoce, doce: {...modalEditaDoce.doce, preco: e.target.value}})} />
                <input type="number" required className="w-1/2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 text-sm" value={modalEditaDoce.doce?.estoque || ''} onChange={(e) => setModalEditaDoce({...modalEditaDoce, doce: {...modalEditaDoce.doce, estoque: e.target.value}})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold text-sm mt-2 shadow-md active:scale-95 transition-all">Gravar Alterações</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
