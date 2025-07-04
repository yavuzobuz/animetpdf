import { createAdminClient, createBrowserClient } from './supabase';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PDFProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  pdf_file_url: string;
  pdf_file_name: string;
  pdf_file_size: number | null;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  analysis_result: any;
  qa_pairs: any;
  animation_scenario: any;
  animation_settings: any;
  created_at: string;
  updated_at: string;
}

export interface AnimationFrame {
  id: string;
  project_id: string;
  frame_number: number;
  frame_description: string;
  image_url: string | null;
  audio_url: string | null;
  duration_seconds: number;
  settings: any;
  created_at: string;
  updated_at: string;
}

// Animation pages
export interface AnimationPage {
  id: string;
  user_id: string;
  topic: string;
  script_summary: string | null;
  scenes: any;
  diagram_svg?: string | null;
  images?: any;
  animation_svgs?: any;
  qa_pairs?: any;
  created_at: string;
  updated_at?: string;
}

// İstatistikler
export interface SiteStatistics {
  converted_pdfs: number;
  created_animations: number;
  total_downloads: number;
  storage_used: number;
}

// Kullanıcı profil istatistikleri
export interface UserStats {
  converted_pdfs: number;
  created_animations: number;
  total_downloads: number;
  storage_used: number;
  plan: string;
  joinDate: string;
  nextBilling: string;
  monthly_pdf_count: number;
  monthly_limit: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked_at: string;
  }>;
}

// Yeni Subscription Interface'leri
export interface SubscriptionPlan {
  id: string;
  name: 'free' | 'starter' | 'pro';
  display_name_tr: string;
  display_name_en: string;
  description_tr?: string;
  description_en?: string;
  monthly_price_usd: number;
  annual_price_usd?: number;
  monthly_pdf_limit: number;
  features: Array<{tr: string; en: string}>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  billing_cycle: 'monthly' | 'annual';
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserUsage {
  id: string;
  user_id: string;
  month_year: string; // '2025-01' format
  pdfs_processed: number;
  animations_created: number;
  storage_used_mb: number;
  last_reset_at: string;
  created_at: string;
  updated_at: string;
}

// Profile işlemleri
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Profile fetch error:', error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Profile update error:', error);
    return false;
  }

  return true;
}

// PDF Proje işlemleri
export async function createPDFProject(
  userId: string, 
  projectData: {
    title: string;
    description?: string;
    pdf_file_url: string;
    pdf_file_name: string;
    pdf_file_size?: number;
  }
): Promise<PDFProject | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('pdf_projects')
    .insert({
      user_id: userId,
      ...projectData
    })
    .select()
    .single();

  if (error) {
    console.error('Project creation error:', error);
    return null;
  }

  return data;
}

// Ana getUserProjects fonksiyonu
export async function getUserProjects(userId: string): Promise<{ success: boolean; data: PDFProject[]; error?: string }> {
  try {
    // Browser'da çalışabilir hale getir
    const supabase = typeof window !== 'undefined' 
      ? createBrowserClient() 
      : createAdminClient();
  const { data, error } = await supabase
    .from('pdf_projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Projects fetch error:', error);
      return { success: false, data: [], error: error.message };
  }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Projects fetch exception:', error);
    return { success: false, data: [], error: 'Bilinmeyen hata oluştu' };
  }
}

// Ana getUserProfile fonksiyonu
export const getUserProfile = async (userId: string) => {
  try {
    // Browser'da çalışabilir hale getir
    const supabase = typeof window !== 'undefined' 
      ? createBrowserClient() 
      : createAdminClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Profile fetch exception:', error);
    return { success: false, data: null, error: 'Bilinmeyen hata oluştu' };
  }
};

export async function getProject(projectId: string): Promise<PDFProject | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('pdf_projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Project fetch error:', error);
    return null;
  }

  return data;
}

export async function updateProject(
  projectId: string, 
  updates: Partial<PDFProject>
): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('pdf_projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', projectId);

  if (error) {
    console.error('Project update error:', error);
    return false;
  }

  return true;
}

// Animasyon Frame işlemleri
export async function getProjectFrames(projectId: string): Promise<AnimationFrame[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('animation_frames')
    .select('*')
    .eq('project_id', projectId)
    .order('frame_number', { ascending: true });

  if (error) {
    console.error('Frames fetch error:', error);
    return [];
  }

  return data || [];
}

export async function createFrame(
  projectId: string,
  frameData: {
    frame_number: number;
    frame_description: string;
    image_url?: string;
    audio_url?: string;
    duration_seconds?: number;
    settings?: any;
  }
): Promise<AnimationFrame | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('animation_frames')
    .insert({
      project_id: projectId,
      ...frameData
    })
    .select()
    .single();

  if (error) {
    console.error('Frame creation error:', error);
    return null;
  }

  return data;
}

export async function updateFrame(
  frameId: string,
  updates: Partial<AnimationFrame>
): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('animation_frames')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', frameId);

  if (error) {
    console.error('Frame update error:', error);
    return false;
  }

  return true;
}

export async function deleteFrame(frameId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('animation_frames')
    .delete()
    .eq('id', frameId);

  if (error) {
    console.error('Frame delete error:', error);
    return false;
  }

  return true;
}

export const getProjectDetails = async (projectId: string, userId: string) => {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('pdf_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Project details fetch error:', error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Project details fetch exception:', error);
    return { success: false, data: null, error: 'Bilinmeyen hata oluştu' };
  }
};

// Proje silme
export async function deleteProject(projectId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = typeof window !== 'undefined' ? createBrowserClient() : createAdminClient();
    
    // Önce pdf_projects tablosunda dene
    const { data: pdfProj } = await supabase
      .from('pdf_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .maybeSingle();

    if (pdfProj) {
      const { error: delErr } = await supabase
        .from('pdf_projects')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', projectId)
        .eq('user_id', userId);
      if (delErr) return { success: false, error: delErr.message };
      return { success: true };
    }

    // Sonra animation_pages tablosunda dene (user_id null olabileceği için OR şartı)
    const { data: animPage } = await supabase
      .from('animation_pages')
      .select('id')
      .eq('id', projectId)
      .or(`user_id.eq.${userId},user_id.is.null`)
      .maybeSingle();

    if (!animPage) {
      return { success: false, error: 'Proje bulunamadı veya yetkiniz yok' };
    }

    const { error: delAnimErr } = await supabase
      .from('animation_pages')
      .delete()
      .eq('id', projectId);

    if (delAnimErr) {
      console.error('Animation page delete error:', delAnimErr);
      return { success: false, error: delAnimErr.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Project delete exception:', error);
    return { success: false, error: 'Bilinmeyen hata oluştu' };
  }
}

// Animation pages
export async function getUserAnimationPages(userId: string): Promise<{ success: boolean; data: AnimationPage[]; error?: string }> {
  try {
    const supabase = typeof window !== 'undefined' ? createBrowserClient() : createAdminClient();
    const { data, error } = await supabase
      .from('animation_pages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Animation pages fetch error:', error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Animation pages fetch exception:', error);
    return { success: false, data: [], error: 'Bilinmeyen hata oluştu' };
  }
}

export async function getSiteStatistics(): Promise<{ success: boolean; data: SiteStatistics; error?: string }> {
  try {
    const supabase = typeof window !== 'undefined' ? createBrowserClient() : createAdminClient();
    const { data, error } = await supabase
      .from('statistics')
      .select('converted_pdfs, created_animations, total_downloads, storage_used')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Statistics fetch error:', error);
      return { success: false, data: { converted_pdfs: 0, created_animations: 0, total_downloads: 0, storage_used: 0 }, error: error.message };
    }
    if (!data) {
      // tabloda hiç satır yoksa sıfırlar dön
      return { success: true, data: { converted_pdfs: 0, created_animations: 0, total_downloads: 0, storage_used: 0 } };
    }
    return { success: true, data: data as SiteStatistics };
  } catch (e) {
    console.error('Statistics fetch exception:', e);
    return { success: false, data: { converted_pdfs: 0, created_animations: 0, total_downloads: 0, storage_used: 0 }, error: 'Bilinmeyen hata' };
  }
}

// Kullanıcı özel istatistikleri
export async function getUserStats(userId: string): Promise<{ success: boolean; data: UserStats; error?: string }> {
  try {
    const supabase = typeof window !== 'undefined' ? createBrowserClient() : createAdminClient();
    
    // Kullanıcı profil bilgisini al
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at, subscription_plan, next_billing_date')
      .eq('id', userId)
      .single();

    // PDF projelerini say (toplam)
    const { count: pdfCount } = await supabase
      .from('pdf_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false);

    // Bu ayki PDF sayısını hesapla
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const { count: monthlyPdfCount } = await supabase
      .from('pdf_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .gte('created_at', firstDayOfMonth.toISOString());

    // Animasyon sayfalarını say
    const { count: animationCount } = await supabase
      .from('animation_pages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Kullanıcı başarılarını al
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select(`
        id,
        unlocked_at,
        achievements!inner (
          id,
          title,
          description,
          icon
        )
      `)
      .eq('user_id', userId);

    // Storage kullanımını hesapla (PDF dosya boyutları toplamı)
    const { data: storageData } = await supabase
      .from('pdf_projects')
      .select('pdf_file_size')
      .eq('user_id', userId)
      .eq('is_deleted', false);

    const storageUsed = storageData?.reduce((total, project) => {
      return total + (project.pdf_file_size || 0);
    }, 0) || 0;

    // Downloads toplamı (şimdilik 0, ileride tracking eklenebilir)
    const totalDownloads = 0;

    // Plan limitlerini belirle – dinamik olarak subscription_plans tablosundan al
    const plan = profile?.subscription_plan || 'free';

    let monthlyLimit = 5; // Varsayılan Free limiti
    try {
      const { data: planRow } = await supabase
        .from('subscription_plans')
        .select('monthly_pdf_limit')
        .eq('name', plan.toLowerCase())
        .single();

      if (planRow && typeof planRow.monthly_pdf_limit === 'number') {
        monthlyLimit = planRow.monthly_pdf_limit;
      }
    } catch (e) {
      console.warn('Plan limit fetch failed, varsayılan limit kullanılacak', e);
    }

    const userStats: UserStats = {
      converted_pdfs: pdfCount || 0,
      created_animations: animationCount || 0,
      total_downloads: totalDownloads,
      storage_used: Math.round(storageUsed / (1024 * 1024 * 1024) * 100) / 100, // GB cinsinden
      plan: plan,
      joinDate: profile?.created_at || new Date().toISOString(),
      nextBilling: profile?.next_billing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      monthly_pdf_count: monthlyPdfCount || 0,
      monthly_limit: monthlyLimit,
      achievements: achievements?.map(a => {
        // Supabase'in yanlış tip çıkarımı yapmasına karşın 'any' kullanarak hatayı gideriyoruz.
        const achievement = a.achievements as any;
        return {
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          unlocked_at: a.unlocked_at
        };
      }) || []
    };

    return { success: true, data: userStats };
  } catch (error) {
    console.error('User stats fetch exception:', error);
    return { 
      success: false, 
      data: {
        converted_pdfs: 0,
        created_animations: 0,
        total_downloads: 0,
        storage_used: 0,
        plan: 'Free',
        joinDate: new Date().toISOString(),
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        monthly_pdf_count: 0,
        monthly_limit: 5,
        achievements: []
      },
      error: 'Bilinmeyen hata' 
    };
  }
}

// Subscription Plan Functions
export async function getAllSubscriptionPlans(): Promise<{ success: boolean; data: SubscriptionPlan[]; error?: string }> {
  try {
    const supabase = typeof window !== 'undefined' 
      ? createBrowserClient() 
      : createAdminClient();
    
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Subscription plans fetch error:', error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Subscription plans fetch exception:', error);
    return { success: false, data: [], error: 'Bilinmeyen hata oluştu' };
  }
}

export async function getUserSubscription(userId: string): Promise<{ success: boolean; data: (UserSubscription & { plan: SubscriptionPlan }) | null; error?: string }> {
  try {
    const supabase = typeof window !== 'undefined' 
      ? createBrowserClient() 
      : createAdminClient();
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('User subscription fetch error:', error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: data || null };
  } catch (error) {
    console.error('User subscription fetch exception:', error);
    return { success: false, data: null, error: 'Bilinmeyen hata oluştu' };
  }
}

export async function getUserCurrentUsage(userId: string): Promise<{ success: boolean; data: UserUsage | null; error?: string }> {
  try {
    const supabase = typeof window !== 'undefined' 
      ? createBrowserClient() 
      : createAdminClient();
    
    const currentMonth = new Date().toISOString().slice(0, 7); // '2025-01' format
    
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('User usage fetch error:', error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: data || null };
  } catch (error) {
    console.error('User usage fetch exception:', error);
    return { success: false, data: null, error: 'Bilinmeyen hata oluştu' };
  }
}

export async function checkUserPDFLimit(userId: string): Promise<{ success: boolean; canProcess: boolean; currentUsage: number; limit: number; error?: string }> {
  try {
    // Get user's current plan
    const userSubscription = await getUserSubscription(userId);
    if (!userSubscription.success) {
      return { success: false, canProcess: false, currentUsage: 0, limit: 0, error: userSubscription.error };
    }

    // If no subscription, get free plan
    let plan: SubscriptionPlan;
    if (!userSubscription.data) {
      const plans = await getAllSubscriptionPlans();
      if (!plans.success) {
        return { success: false, canProcess: false, currentUsage: 0, limit: 0, error: plans.error };
      }
      const freePlan = plans.data.find(p => p.name === 'free');
      if (!freePlan) {
        return { success: false, canProcess: false, currentUsage: 0, limit: 0, error: 'Free plan bulunamadı' };
      }
      plan = freePlan;
    } else {
      plan = userSubscription.data.plan;
    }

    // Get current usage
    const usage = await getUserCurrentUsage(userId);
    if (!usage.success) {
      return { success: false, canProcess: false, currentUsage: 0, limit: plan.monthly_pdf_limit, error: usage.error };
    }

    const currentUsage = usage.data?.pdfs_processed || 0;
    const canProcess = currentUsage < plan.monthly_pdf_limit;

    return {
      success: true,
      canProcess,
      currentUsage,
      limit: plan.monthly_pdf_limit
    };
  } catch (error) {
    console.error('PDF limit check exception:', error);
    return { success: false, canProcess: false, currentUsage: 0, limit: 0, error: 'Bilinmeyen hata oluştu' };
  }
}

export async function incrementUserUsage(userId: string, type: 'pdf' | 'animation'): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const currentMonth = new Date().toISOString().slice(0, 7); // '2025-01' format
    
    // Upsert usage record
    const { error } = await supabase
      .from('user_usage')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        pdfs_processed: type === 'pdf' ? 1 : 0,
        animations_created: type === 'animation' ? 1 : 0,
        last_reset_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,month_year',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Usage increment error:', error);
      return { success: false, error: error.message };
    }

    // If it's a new record, we need to increment properly
    const { error: updateError } = await supabase.rpc('increment_user_usage', {
      p_user_id: userId,
      p_month_year: currentMonth,
      p_pdf_increment: type === 'pdf' ? 1 : 0,
      p_animation_increment: type === 'animation' ? 1 : 0
    });

    if (updateError) {
      console.error('Usage increment RPC error:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Usage increment exception:', error);
    return { success: false, error: 'Bilinmeyen hata oluştu' };
  }
}

export async function createUserSubscription(
  userId: string, 
  planId: string, 
  billingCycle: 'monthly' | 'annual' = 'monthly'
): Promise<{ success: boolean; data?: UserSubscription; error?: string }> {
  try {
    const supabase = createAdminClient();
    
    // Calculate period end date
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    if (billingCycle === 'monthly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        billing_cycle: billingCycle,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Subscription creation error:', error);
      return { success: false, error: error.message };
    }

    // Update profile with current plan
    await supabase
      .from('profiles')
      .update({
        current_plan_id: planId,
        subscription_status: 'active'
      })
      .eq('id', userId);

    return { success: true, data };
  } catch (error) {
    console.error('Subscription creation exception:', error);
    return { success: false, error: 'Bilinmeyen hata oluştu' };
  }
}
