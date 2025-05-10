import { CheckIn, Member, Payment, Plan, Trainer } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "./firebase";

// Constantes para coleções
const COLLECTIONS = {
  MEMBERS: "members",
  TRAINERS: "trainers",
  PLANS: "plans",
  PAYMENTS: "payments",
  CHECK_INS: "checkIns"
};

// Membros
export async function getAllMembers() {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.MEMBERS));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
}

export async function getMemberById(id: string) {
  const docRef = doc(db, COLLECTIONS.MEMBERS, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Member;
  } else {
    throw new Error("Membro não encontrado");
  }
}

export async function createMember(member: Omit<Member, "id" | "registrationDate" | "lastPaymentDate" | "nextPaymentDate">) {
  const registrationDate = serverTimestamp();

  const docRef = await addDoc(collection(db, COLLECTIONS.MEMBERS), {
    ...member,
    registrationDate,
    lastPaymentDate: null,
    nextPaymentDate: null,
  });

  return docRef.id;
}

export async function updateMember(id: string, member: Partial<Omit<Member, "id">>) {
  const docRef = doc(db, COLLECTIONS.MEMBERS, id);
  await updateDoc(docRef, member);
  return id;
}

export async function deleteMember(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.MEMBERS, id));
  return id;
}

/**
 * Função auxiliar para obter datas de início e fim de um mês específico
 */
function getMonthDateRange(year: number, month: number) {
  // Mês em JavaScript é 0-indexado (janeiro é 0)
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);
  
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
  const endOfMonthStr = endOfMonth.toISOString().split('T')[0];
  
  return { startOfMonthStr, endOfMonthStr };
}

/**
 * Função para buscar contagem de membros do mês anterior
 */
export async function getMembersLastMonth() {
  try {
    // Calcular o mês anterior
    const currentDate = new Date();
    const lastMonth = currentDate.getMonth(); // 0-indexado
    const lastMonthYear = currentDate.getFullYear();
    
    // Contar quantos membros já estavam registrados até o final do mês anterior
    // Vamos usar o campo registrationDate do membro
    const endOfLastMonth = new Date(lastMonthYear, lastMonth + 1, 0); // Último dia do mês anterior
    
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.MEMBERS),
        where("registrationDate", "<=", Timestamp.fromDate(endOfLastMonth))
      )
    );
    
    return querySnapshot.size;
  } catch (error) {
    console.error("Erro ao buscar membros do mês anterior:", error);
    return 0;
  }
}

/**
 * Função para buscar pagamentos de um mês específico
 */
export async function getPaymentsByMonth(year: number, month: number) {
  const { startOfMonthStr, endOfMonthStr } = getMonthDateRange(year, month);

  const querySnapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.PAYMENTS),
      where("date", ">=", startOfMonthStr),
      where("date", "<=", endOfMonthStr)
    )
  );

  let totalAmount = 0;
  querySnapshot.forEach(doc => {
    const data = doc.data();
    totalAmount += data.amount || 0;
  });

  return totalAmount;
}

/**
 * Função para buscar pagamentos do mês atual
 */
export async function getPaymentsThisMonth() {
  // Obtém a data no formato YYYY-MM-DD
  const now = new Date();
  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const endOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

  const querySnapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.PAYMENTS),
      where("date", ">=", startOfMonthStr),
      where("date", "<=", endOfMonthStr)
    )
  );

  let totalAmount = 0;
  querySnapshot.forEach(doc => {
    const data = doc.data();
    totalAmount += data.amount || 0;
  });

  return totalAmount;
}

/**
 * Função para buscar pagamentos do mês anterior
 */
export async function getPaymentsLastMonth() {
  const now = new Date();
  const lastMonth = now.getMonth(); // 0-indexado
  const year = lastMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = lastMonth === 0 ? 12 : lastMonth;
  
  return getPaymentsByMonth(year, month);
}

/**
 * Função para buscar check-ins de um mês específico
 */
export async function getCheckInsByMonth(year: number, month: number) {
  const { startOfMonthStr, endOfMonthStr } = getMonthDateRange(year, month);

  const querySnapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.CHECK_INS),
      where("date", ">=", startOfMonthStr),
      where("date", "<=", endOfMonthStr)
    )
  );

  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Função para buscar check-ins do mês atual
 */
export async function getCheckInsThisMonth() {
  // Obtém a data no formato YYYY-MM-DD
  const now = new Date();
  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const endOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

  const querySnapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.CHECK_INS),
      where("date", ">=", startOfMonthStr),
      where("date", "<=", endOfMonthStr)
    )
  );

  return querySnapshot.docs.map(doc => doc.data());
}

/**
 * Função para buscar check-ins do mês anterior
 */
export async function getCheckInsLastMonth() {
  const now = new Date();
  const lastMonth = now.getMonth(); // 0-indexado
  const year = lastMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = lastMonth === 0 ? 12 : lastMonth;
  
  return getCheckInsByMonth(year, month);
}

/**
 * Função agregada para buscar todos os dados do dashboard de uma vez
 */
export async function getDashboardData() {
  try {
    // Executar todas as chamadas em paralelo para melhor performance
    const [
      members,
      membersLastMonthCount,
      trainers,
      paymentsThisMonth,
      paymentsLastMonth,
      checkInsThisMonth,
      checkInsLastMonth
    ] = await Promise.all([
      getAllMembers(),
      getMembersLastMonth(),
      getAllTrainers(),
      getPaymentsThisMonth(),
      getPaymentsLastMonth(),
      getCheckInsThisMonth(),
      getCheckInsLastMonth()
    ]);
    
    return {
      members,
      membersCount: members.length,
      membersLastMonth: membersLastMonthCount,
      trainers,
      trainersCount: trainers.length,
      paymentsAmount: paymentsThisMonth,
      paymentsLastMonth,
      checkIns: checkInsThisMonth,
      checkInsCount: checkInsThisMonth.length,
      checkInsLastMonth: checkInsLastMonth.length
    };
  } catch (error) {
    console.error('Erro em getDashboardData:', error);
    throw error;
  }
}

export async function getUpcomingPayments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Zerar horas para comparar corretamente

  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  nextWeek.setHours(23, 59, 59, 999); // Definir o fim do dia

  const querySnapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.PAYMENTS),
      where("dueDate", ">=", today.toISOString().split("T")[0]), // Comparação com formato string 'YYYY-MM-DD'
      where("dueDate", "<=", nextWeek.toISOString().split("T")[0])
    )
  );

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Treinadores
export async function getAllTrainers() {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.TRAINERS));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trainer));
}

export async function getTrainerById(id: string) {
  const docRef = doc(db, COLLECTIONS.TRAINERS, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Trainer;
  } else {
    throw new Error("Treinador não encontrado");
  }
}

export async function createTrainer(trainer: Omit<Trainer, "id" | "hireDate">) {
  const hireDate = serverTimestamp();

  const docRef = await addDoc(collection(db, COLLECTIONS.TRAINERS), {
    ...trainer,
    hireDate,
  });

  return docRef.id;
}

export async function updateTrainer(id: string, trainer: Partial<Omit<Trainer, "id">>) {
  const docRef = doc(db, COLLECTIONS.TRAINERS, id);
  await updateDoc(docRef, trainer);
  return id;
}

export async function deleteTrainer(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.TRAINERS, id));
  return id;
}

// Planos
export async function getAllPlans() {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.PLANS));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
}

export async function getActivePlans() {
  const q = query(
    collection(db, COLLECTIONS.PLANS),
    where("active", "==", true)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
}

export async function getPlanById(id: string) {
  const docRef = doc(db, COLLECTIONS.PLANS, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Plan;
  } else {
    throw new Error("Plano não encontrado");
  }
}

export async function createPlan(plan: Omit<Plan, "id">) {
  const docRef = await addDoc(collection(db, COLLECTIONS.PLANS), plan);
  return docRef.id;
}

export async function updatePlan(id: string, plan: Partial<Omit<Plan, "id">>) {
  const docRef = doc(db, COLLECTIONS.PLANS, id);
  await updateDoc(docRef, plan);
  return id;
}

export async function deletePlan(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.PLANS, id));
  return id;
}

// Pagamentos
export async function getAllPayments() {
  const querySnapshot = await getDocs(
    query(collection(db, COLLECTIONS.PAYMENTS), orderBy("date", "desc"))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
}

export async function getMemberPayments(memberId: string) {
  const q = query(
    collection(db, COLLECTIONS.PAYMENTS),
    where("memberId", "==", memberId),
    orderBy("date", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
}

export async function createPayment(payment: Omit<Payment, "id">) {
  // Atualizar a data de último pagamento e próximo pagamento do membro
  const paymentDate = new Date(payment.date);

  // Buscar plano para calcular próximo pagamento
  const planDoc = await getDoc(doc(db, COLLECTIONS.PLANS, payment.planId));
  if (!planDoc.exists()) {
    throw new Error("Plano não encontrado");
  }
  const plan = planDoc.data() as Plan;

  // Calcular próxima data de pagamento baseada na duração do plano
  const nextPaymentDate = new Date(paymentDate);
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + plan.duration);

  // Atualizar membro
  const memberRef = doc(db, COLLECTIONS.MEMBERS, payment.memberId);
  await updateDoc(memberRef, {
    lastPaymentDate: Timestamp.fromDate(paymentDate),
    nextPaymentDate: Timestamp.fromDate(nextPaymentDate),
    plan: payment.planId,
    status: "active"
  });

  // Criar pagamento
  const docRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), payment);
  return docRef.id;
}

export async function updatePayment(id: string, payment: Partial<Omit<Payment, "id">>) {
  const docRef = doc(db, COLLECTIONS.PAYMENTS, id);
  await updateDoc(docRef, payment);
  return id;
}

export async function deletePayment(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.PAYMENTS, id));
  return id;
}

// Check-ins
export async function getAllCheckIns() {
  const querySnapshot = await getDocs(
    query(collection(db, COLLECTIONS.CHECK_INS))
  );
  const checkIns = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheckIn));

  // Ordena os check-ins manualmente em JavaScript (sem depender de índices compostos)
  checkIns.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime(); // Ordenar em ordem decrescente pela data
  });

  return checkIns;
}

export async function getMemberCheckIns(memberId: string) {
  const q = query(
    collection(db, COLLECTIONS.CHECK_INS),
    where("memberId", "==", memberId)
  );

  const querySnapshot = await getDocs(q);
  const checkIns = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheckIn));

  // Ordena os check-ins manualmente em JavaScript (sem depender de índices compostos)
  checkIns.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime(); // Ordenar em ordem decrescente pela data
  });

  return checkIns;
}

export async function createCheckIn(memberId: string) {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];
  const timestamp = now.getTime(); // timestamp para facilitar a ordenação

  const docRef = await addDoc(collection(db, COLLECTIONS.CHECK_INS), {
    memberId,
    date,
    time,
    timestamp // Adiciona o campo "timestamp"
  });

  return docRef.id;
}

export async function updateCheckIn(id: string, checkIn: Partial<Omit<CheckIn, "id">>) {
  const docRef = doc(db, COLLECTIONS.CHECK_INS, id);
  await updateDoc(docRef, checkIn);
  return id;
}

export async function deleteCheckIn(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.CHECK_INS, id));
  return id;
}