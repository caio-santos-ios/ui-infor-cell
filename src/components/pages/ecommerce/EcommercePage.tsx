"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { uriBase } from "@/service/api.service";
import {
  TEcommerceConfig,
  TEcommerceProduct,
  TEcommerceCartItem,
  TEcommerceCustomer,
  TEcommerceOrder,
} from "@/types/ecommerce/ecommerce.type";
import {
  MdShoppingCart,
  MdClose,
  MdAdd,
  MdRemove,
  MdSearch,
  MdStore,
  MdCheckCircle,
  MdContentCopy,
  MdLocalShipping,
  MdOpenInNew,
  MdPerson,
  MdLogout,
} from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─── helpers ─────────────────────────────────────────────────────────────────
const fMoney = (v: number) =>
  v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "R$ 0,00";

function api(plan: string, company: string, store: string) {
  const base = `${uriBase}/api/ecommerce/public`;
  return {
    config: () => axios.get(`${base}/config/${plan}/${company}/${store}`),
    products: (search?: string, cat?: string) =>
      axios.get(`${base}/products/${plan}/${company}/${store}`, { params: { search, categoryId: cat } }),
    register: (body: object) => axios.post(`${base}/register`, { ...body, plan, company, store }),
    login: (body: object) => axios.post(`${base}/login`, { ...body, plan, company, store }),
    checkout: (body: object) => axios.post(`${base}/checkout`, { ...body, plan, company, store }),
  };
}

// ─── Tipos internos de tela ───────────────────────────────────────────────────
type Screen = "store" | "product" | "cart" | "auth" | "checkout" | "success";

// ─── Componente principal ─────────────────────────────────────────────────────
export default function EcommercePage() {
  const [plan, setPlan] = useState("");
  const [company, setCompany] = useState("");
  const [store, setStore] = useState("");
  const [config, setConfig] = useState<TEcommerceConfig | null>(null);
  const [products, setProducts] = useState<TEcommerceProduct[]>([]);
  const [cart, setCart] = useState<TEcommerceCartItem[]>([]);
  const [customer, setCustomer] = useState<TEcommerceCustomer | null>(null);
  const [screen, setScreen] = useState<Screen>("store");
  const [selected, setSelected] = useState<TEcommerceProduct | null>(null);
  const [order, setOrder] = useState<TEcommerceOrder | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // pegar parâmetros da URL: /ecommerce?plan=X&company=Y&store=Z
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("plan") ?? "";
    const c = params.get("company") ?? "";
    const s = params.get("store") ?? "";
    console.log(p)
    console.log(c)
    console.log(s)
    
    setPlan(p); 
    setCompany(c); 
    setStore(s);

    // recuperar sessão salva
    const saved = localStorage.getItem("ec_customer");
    if (saved) setCustomer(JSON.parse(saved));
  }, []);

  // carregar config e produtos
  useEffect(() => {
    if (!plan || !company || !store) return;
    const a = api(plan, company, store);

    (async () => {
      setLoading(true);
      try {
        const [cfgRes, prodRes] = await Promise.all([a.config(), a.products()]);
        const cfg = cfgRes.data?.result?.data;
        if (!cfg || cfg.enabled === false) { setNotFound(true); setLoading(false); return; }
        setConfig(cfg);
        setProducts(prodRes.data?.result?.data ?? []);
      } catch { setNotFound(true); }
      setLoading(false);
    })();
  }, [plan, company, store]);

  const fetchProducts = useCallback(async (s?: string) => {
    if (!plan) return;
    const res = await api(plan, company, store).products(s);
    setProducts(res.data?.result?.data ?? []);
  }, [plan, company, store]);

  // ─── cart helpers ───────────────────────────────────────────────────────────
  const addToCart = (product: TEcommerceProduct) => {
    const stock = product.stocks[0];
    if (!stock) return;
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, {
        productId: product.id,
        stockId: stock.id,
        productName: product.name,
        quantity: 1,
        price: stock.priceDiscount > 0 ? stock.priceDiscount : stock.price,
      }];
    });
    toast.success("Adicionado ao carrinho!", { theme: "colored", autoClose: 1500 });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.productId === productId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const shipping = config?.shippingEnabled
    ? config.shippingFreeAbove > 0 && cartTotal >= config.shippingFreeAbove
      ? 0
      : config.shippingFixedPrice
    : 0;

  const saveCustomer = (c: TEcommerceCustomer) => {
    setCustomer(c);
    localStorage.setItem("ec_customer", JSON.stringify(c));
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem("ec_customer");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 text-gray-600">
      <MdStore size={56} className="text-gray-300" />
      <p className="text-xl font-semibold">Loja não encontrada ou inativa</p>
      <p className="text-sm text-gray-400">Verifique o link ou entre em contato com a loja.</p>
    </div>
  );

  const primary = config?.primaryColor ?? "#7C3AED";

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <ToastContainer position="top-right" />

      {/* ── Header ── */}
      <header style={{ backgroundColor: primary }} className="sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button onClick={() => setScreen("store")} className="flex items-center gap-2">
            {config?.logoUrl
              ? <img src={config.logoUrl} alt="logo" className="h-9 w-9 rounded-full object-cover" />
              : <MdStore size={28} className="text-white" />}
            <span className="font-bold text-white text-lg truncate max-w-[160px]">
              {config?.storeName ?? "Loja Virtual"}
            </span>
          </button>

          <div className="flex items-center gap-3">
            {customer ? (
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-sm hidden sm:block">{customer.name}</span>
                <button onClick={logout} className="text-white/70 hover:text-white">
                  <MdLogout size={20} />
                </button>
              </div>
            ) : (
              <button onClick={() => setScreen("auth")} className="flex items-center gap-1 text-white/90 hover:text-white text-sm">
                <MdPerson size={20} /> Entrar
              </button>
            )}
            <button
              onClick={() => setScreen("cart")}
              className="relative flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white rounded-full px-3 py-1.5 text-sm font-medium transition"
            >
              <MdShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
              <span className="hidden sm:block">{fMoney(cartTotal)}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Banner ── */}
      {screen === "store" && config?.bannerUrl && (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img src={config.bannerUrl} alt="banner" className="w-full h-full object-cover" />
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* ══ TELA: LOJA ══════════════════════════════════════════════════════ */}
        {screen === "store" && (
          <>
            {config?.storeDescription && (
              <p className="text-gray-500 text-sm mb-4">{config.storeDescription}</p>
            )}

            {/* Busca */}
            <div className="relative mb-6">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); fetchProducts(e.target.value); }}
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
              />
            </div>

            {/* Grid de produtos */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-gray-400">
                <MdStore size={48} className="text-gray-200" />
                <p>Nenhum produto disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => {
                  const stock = p.stocks[0];
                  const price = stock?.priceDiscount > 0 ? stock.priceDiscount : stock?.price ?? 0;
                  const hasDiscount = stock?.priceDiscount > 0 && stock?.price > stock?.priceDiscount;
                  return (
                    <div
                      key={p.id}
                      onClick={() => { setSelected(p); setScreen("product"); }}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden group"
                    >
                      <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                        <MdStore size={48} className="text-gray-300 group-hover:scale-110 transition" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2">{p.name}</p>
                        {p.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.description}</p>}
                        <div className="mt-2 flex items-center justify-between gap-1">
                          <div>
                            {hasDiscount && (
                              <p className="text-xs text-gray-400 line-through">{fMoney(stock.price)}</p>
                            )}
                            <p className="font-bold text-gray-900" style={{ color: primary }}>{fMoney(price)}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                            style={{ backgroundColor: primary }}
                            className="rounded-full p-1.5 text-white hover:opacity-90 transition"
                          >
                            <MdAdd size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{p.quantity} em estoque</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══ TELA: PRODUTO ════════════════════════════════════════════════════ */}
        {screen === "product" && selected && (
          <ProductScreen
            product={selected}
            primary={primary}
            onBack={() => setScreen("store")}
            onAddToCart={addToCart}
          />
        )}

        {/* ══ TELA: CARRINHO ═══════════════════════════════════════════════════ */}
        {screen === "cart" && (
          <CartScreen
            cart={cart}
            shipping={shipping}
            config={config}
            primary={primary}
            onUpdate={updateQty}
            onBack={() => setScreen("store")}
            onCheckout={() => {
              if (!customer) { setScreen("auth"); return; }
              setScreen("checkout");
            }}
          />
        )}

        {/* ══ TELA: AUTH ═══════════════════════════════════════════════════════ */}
        {screen === "auth" && (
          <AuthScreen
            primary={primary}
            api={api(plan, company, store)}
            onSuccess={(c) => {
              saveCustomer(c);
              setScreen(cart.length > 0 ? "checkout" : "store");
            }}
            onBack={() => setScreen("store")}
          />
        )}

        {/* ══ TELA: CHECKOUT ═══════════════════════════════════════════════════ */}
        {screen === "checkout" && customer && (
          <CheckoutScreen
            cart={cart}
            customer={customer}
            shipping={shipping}
            total={cartTotal + shipping}
            primary={primary}
            api={api(plan, company, store)}
            onSuccess={(o) => { setOrder(o); setCart([]); setScreen("success"); }}
            onBack={() => setScreen("cart")}
          />
        )}

        {/* ══ TELA: SUCESSO ════════════════════════════════════════════════════ */}
        {screen === "success" && order && (
          <SuccessScreen
            order={order}
            primary={primary}
            onBack={() => setScreen("store")}
          />
        )}
      </main>
    </div>
  );
}

// ─── Tela: Produto ────────────────────────────────────────────────────────────
function ProductScreen({ product, primary, onBack, onAddToCart }: {
  product: TEcommerceProduct;
  primary: string;
  onBack: () => void;
  onAddToCart: (p: TEcommerceProduct) => void;
}) {
  const stock = product.stocks[0];
  const price = stock?.priceDiscount > 0 ? stock.priceDiscount : stock?.price ?? 0;
  const hasDiscount = stock?.priceDiscount > 0 && stock?.price > stock?.priceDiscount;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← Voltar
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
        <div className="h-56 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
          <MdStore size={80} className="text-gray-300" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
        {product.description && <p className="text-gray-500 text-sm mt-1">{product.description}</p>}
        {product.descriptionComplet && (
          <p className="text-gray-600 text-sm mt-3 leading-relaxed">{product.descriptionComplet}</p>
        )}
        <div className="mt-4 flex items-center gap-4">
          <div>
            {hasDiscount && <p className="text-sm text-gray-400 line-through">{fMoney(stock.price)}</p>}
            <p className="text-2xl font-bold" style={{ color: primary }}>{fMoney(price)}</p>
          </div>
          <p className="text-sm text-gray-400">{product.quantity} em estoque</p>
        </div>
        <button
          onClick={() => onAddToCart(product)}
          style={{ backgroundColor: primary }}
          className="mt-5 w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          <MdShoppingCart size={20} /> Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
}

// ─── Tela: Carrinho ───────────────────────────────────────────────────────────
function CartScreen({ cart, shipping, config, primary, onUpdate, onBack, onCheckout }: {
  cart: TEcommerceCartItem[];
  shipping: number;
  config: TEcommerceConfig | null;
  primary: string;
  onUpdate: (id: string, delta: number) => void;
  onBack: () => void;
  onCheckout: () => void;
}) {
  const total = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  return (
    <div className="max-w-xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">← Voltar</button>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Carrinho</h2>
      {cart.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MdShoppingCart size={48} className="mx-auto mb-2 text-gray-200" />
          <p>Seu carrinho está vazio.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.productId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{item.productName}</p>
                <p className="text-xs text-gray-400">{fMoney(item.price)} cada</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onUpdate(item.productId, -1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                  <MdRemove size={14} />
                </button>
                <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                <button onClick={() => onUpdate(item.productId, 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                  <MdAdd size={14} />
                </button>
              </div>
              <p className="font-bold text-sm text-gray-900 w-20 text-right">{fMoney(item.price * item.quantity)}</p>
            </div>
          ))}

          {/* Resumo */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{fMoney(total)}</span></div>
            {config?.shippingEnabled && (
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1"><MdLocalShipping size={14} /> Frete</span>
                <span>{shipping === 0 ? "Grátis" : fMoney(shipping)}</span>
              </div>
            )}
            {config?.shippingEnabled && config.shippingFreeAbove > 0 && shipping > 0 && (
              <p className="text-xs text-gray-400">Frete grátis acima de {fMoney(config.shippingFreeAbove)}</p>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span><span style={{ color: primary }}>{fMoney(total + shipping)}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            style={{ backgroundColor: primary }}
            className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition"
          >
            Finalizar pedido
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tela: Auth ───────────────────────────────────────────────────────────────
function AuthScreen({ primary, api, onSuccess, onBack }: {
  primary: string;
  api: ReturnType<typeof import("./EcommercePage")["default"] extends any ? any : any>;
  onSuccess: (c: TEcommerceCustomer) => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", document: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = mode === "login"
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);
      const d = res.data?.result?.data;
      if (!d) { toast.error(res.data?.result?.message ?? "Erro"); return; }
      onSuccess(d as TEcommerceCustomer);
    } catch (e: any) {
      toast.error(e.response?.data?.result?.message ?? "Erro ao autenticar");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">← Voltar</button>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-5">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={mode === m ? { backgroundColor: primary } : {}}
              className={`flex-1 py-2 text-sm font-medium transition ${mode === m ? "text-white" : "text-gray-500"}`}
            >
              {m === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {mode === "register" && (
            <>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefone" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
              <input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} placeholder="CPF ou CNPJ" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
            </>
          )}
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="E-mail" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Senha" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />

          <button
            onClick={submit}
            disabled={loading}
            style={{ backgroundColor: primary }}
            className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tela: Checkout ───────────────────────────────────────────────────────────
function CheckoutScreen({ cart, customer, shipping, total, primary, api, onSuccess, onBack }: {
  cart: TEcommerceCartItem[];
  customer: TEcommerceCustomer;
  shipping: number;
  total: number;
  primary: string;
  api: any;
  onSuccess: (o: TEcommerceOrder) => void;
  onBack: () => void;
}) {
  const [billing, setBilling] = useState("PIX");
  const [address, setAddress] = useState({ zipCode: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" });
  const [card, setCard] = useState({ holderName: "", number: "", expiryMonth: "", expiryYear: "", cvv: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!address.zipCode || !address.street || !address.number) {
      toast.error("Preencha o endereço de entrega."); return;
    }
    setLoading(true);
    try {
      const body: any = {
        customerId: customer.id,
        billingType: billing,
        items: cart.map((i) => ({ productId: i.productId, stockId: i.stockId, productName: i.productName, quantity: i.quantity, price: i.price })),
        shippingAddress: address,
      };
      if (billing === "CREDIT_CARD") {
        body.cardHolderName = card.holderName;
        body.cardNumber = card.number;
        body.cardExpiryMonth = card.expiryMonth;
        body.cardExpiryYear = card.expiryYear;
        body.cardCvv = card.cvv;
      }
      const res = await api.checkout(body);
      const d = res.data?.result?.data;
      if (!d) { toast.error(res.data?.result?.message ?? "Erro"); return; }
      onSuccess(d as TEcommerceOrder);
    } catch (e: any) {
      toast.error(e.response?.data?.result?.message ?? "Erro ao finalizar pedido");
    } finally { setLoading(false); }
  };

  const inp = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200";

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">← Voltar</button>
      <h2 className="text-lg font-bold text-gray-900">Finalizar pedido</h2>

      {/* Forma de pagamento */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Forma de pagamento</h3>
        <div className="grid grid-cols-3 gap-2">
          {["PIX", "BOLETO", "CREDIT_CARD"].map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={billing === b ? { backgroundColor: primary } : {}}
              className={`py-2 rounded-xl text-sm font-medium border transition ${billing === b ? "text-white border-transparent" : "border-gray-200 text-gray-600"}`}
            >
              {b === "CREDIT_CARD" ? "Cartão" : b === "BOLETO" ? "Boleto" : "PIX"}
            </button>
          ))}
        </div>

        {billing === "CREDIT_CARD" && (
          <div className="mt-4 space-y-2">
            <input value={card.holderName} onChange={(e) => setCard({ ...card, holderName: e.target.value })} placeholder="Nome no cartão" className={inp} />
            <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="Número do cartão" className={inp} />
            <div className="grid grid-cols-3 gap-2">
              <input value={card.expiryMonth} onChange={(e) => setCard({ ...card, expiryMonth: e.target.value })} placeholder="Mês" className={inp} />
              <input value={card.expiryYear} onChange={(e) => setCard({ ...card, expiryYear: e.target.value })} placeholder="Ano" className={inp} />
              <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="CVV" className={inp} />
            </div>
          </div>
        )}
      </div>

      {/* Endereço */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><MdLocalShipping size={18} />Endereço de entrega</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} placeholder="CEP" className={inp} />
            <input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="Estado" className={inp} />
          </div>
          <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Cidade" className={inp} />
          <input value={address.neighborhood} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} placeholder="Bairro" className={inp} />
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Rua / Avenida" className={inp} />
            </div>
            <input value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} placeholder="Nº" className={inp} />
          </div>
          <input value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} placeholder="Complemento (opcional)" className={inp} />
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-sm space-y-1">
        {cart.map((i) => (
          <div key={i.productId} className="flex justify-between text-gray-600">
            <span>{i.productName} x{i.quantity}</span><span>{fMoney(i.price * i.quantity)}</span>
          </div>
        ))}
        {shipping > 0 && <div className="flex justify-between text-gray-600"><span>Frete</span><span>{fMoney(shipping)}</span></div>}
        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
          <span>Total</span><span style={{ color: primary }}>{fMoney(total)}</span>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={loading}
        style={{ backgroundColor: primary }}
        className="w-full py-3 rounded-xl text-white font-bold hover:opacity-90 transition disabled:opacity-60"
      >
        {loading ? "Processando..." : `Pagar ${fMoney(total)}`}
      </button>
    </div>
  );
}

// ─── Tela: Sucesso ────────────────────────────────────────────────────────────
function SuccessScreen({ order, primary, onBack }: { order: TEcommerceOrder; primary: string; onBack: () => void }) {
  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copiado!", { autoClose: 1000 }); };

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="text-center py-4">
        <MdCheckCircle size={56} className="mx-auto mb-2" style={{ color: primary }} />
        <h2 className="text-xl font-bold text-gray-900">Pedido #{order.code} realizado!</h2>
        <p className="text-gray-500 text-sm mt-1">
          {order.billingType === "PIX" && "Escaneie o QR Code ou copie o código PIX abaixo."}
          {order.billingType === "BOLETO" && "Pague o boleto para confirmar seu pedido."}
          {order.billingType === "CREDIT_CARD" && "Pagamento com cartão processado!"}
        </p>
      </div>

      {/* PIX */}
      {order.billingType === "PIX" && order.pixQrCode && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-3">
          {order.pixQrCodeImage && (
            <img src={`data:image/png;base64,${order.pixQrCodeImage}`} alt="QR Code PIX" className="w-48 h-48" />
          )}
          <div className="w-full">
            <p className="text-xs text-gray-400 mb-1">Código Pix Copia e Cola</p>
            <div className="flex gap-2 items-center">
              <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 break-all select-all">{order.pixQrCode}</code>
              <button onClick={() => copy(order.pixQrCode)} className="shrink-0 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                <MdContentCopy size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boleto */}
      {order.billingType === "BOLETO" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          {order.identificationField && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Linha digitável</p>
              <div className="flex gap-2 items-center">
                <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 break-all">{order.identificationField}</code>
                <button onClick={() => copy(order.identificationField)} className="shrink-0 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <MdContentCopy size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          )}
          {order.paymentUrl && (
            <a href={order.paymentUrl} target="_blank" rel="noopener noreferrer"
              style={{ backgroundColor: primary }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition">
              <MdOpenInNew size={18} /> Visualizar boleto
            </a>
          )}
        </div>
      )}

      <button onClick={onBack} className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition">
        Continuar comprando
      </button>
    </div>
  );
}
