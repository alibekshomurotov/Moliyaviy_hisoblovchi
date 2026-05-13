// Real AI yordamchi - OpenRouter API orqali
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Moliyaviy maslahatlar bazasi
const financialTips = [
  "💡 50/30/20 qoidasini qo'llang: 50% ehtiyojlar, 30% istaklar, 20% jamg'arma",
  "📊 Har oy daromadingizning kamida 10% ini jamg'aring",
  "🎯 3-6 oylik xarajatlaringizni qoplaydigan favqulodda fond yarating",
  "💳 Kredit kartalarini to'g'ri ishlating, foizlardan qoching",
  "📈 Uzoq muddatli maqsadlar uchun investitsiya qilishni o'rganing",
  "🏦 Har oy avtomatik jamg'arma tizimini yo'lga qo'ying",
  "📝 Xarajatlaringizni kundalik qilib yozib boring",
  "🎯 Bir vaqtning o'zida 3 tadan ko'p moliyaviy maqsad qo'ymang"
];

function getRandomTip() {
  return financialTips[Math.floor(Math.random() * financialTips.length)];
}

function getAdvice(income, expense, topCategory) {
  const savings = income - expense;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  
  if (savings < 0) {
    return `⚠️ Xarajatlaringiz daromadingizdan ${Math.abs(savings).toLocaleString()} so'mga oshib ketgan. ${getRandomTip()}`;
  } else if (savingsRate < 10) {
    return `📊 Siz daromadingizning faqat ${savingsRate.toFixed(1)}% ini jamg'armoqdasiz. ${getRandomTip()}`;
  } else if (savingsRate < 30) {
    return `✅ Yaxshi! Daromadingizning ${savingsRate.toFixed(1)}% ini jamg'armoqdasiz. Shunday davom eting! ${getRandomTip()}`;
  } else {
    return `🌟 Ajoyib! Daromadingizning ${savingsRate.toFixed(1)}% ini jamg'armoqdasiz. Moliyaviy erkinlik sari to'g'ri ketyapsiz! 🚀 ${getRandomTip()}`;
  }
}

function getCategoryAnalysis(categoryExpense, totalExpense) {
  if (Object.keys(categoryExpense).length === 0) return "Hali ma'lumot yo'q";
  
  const sorted = Object.entries(categoryExpense).sort((a, b) => b[1] - a[1]);
  const analysis = sorted.map(([cat, amt], i) => {
    const percent = (amt / totalExpense) * 100;
    const emoji = i === 0 ? '🔴' : i === 1 ? '🟡' : '🟢';
    return `${emoji} ${cat}: ${percent.toFixed(1)}% (${amt.toLocaleString()} so'm)`;
  });
  
  return analysis.join('\n');
}

function getMotivationalMessage(savingsRate) {
  if (savingsRate < 10) {
    return "💪 Kichik qadamlar katta natijalarga olib keladi. Bugundan boshlab har kuni 5000 so'm jamg'arishni boshlang!";
  } else if (savingsRate < 30) {
    return "🌟 Ajoyib! Shunday davom eting. 6 oy ichida favqulodda jamg'armangizni yarata olasiz!";
  } else {
    return "🏆 Siz moliyaviy intizomning ustasisiz! Endi investitsiya qilish haqida o'ylash vaqti keldi.";
  }
}

export const aiService = {
  getRealAIResponse: async (userMessage, transactions) => {
    const totalIncome = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0;
    const totalExpense = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0;
    const balance = totalIncome - totalExpense;
    
    const categoryExpense = {};
    transactions?.filter(t => t.type === 'expense').forEach(t => {
      categoryExpense[t.category] = (categoryExpense[t.category] || 0) + t.amount;
    });
    
    if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== '') {
      try {
        const response = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [
              {
                role: 'system',
                content: `Siz professional moliyaviy maslahatchi AIsiz. Foydalanuvchining moliyaviy savollariga o'zbek tilida, qisqa va foydali javob bering.
                
                Foydalanuvchi moliyaviy holati:
                - Daromad: ${totalIncome.toLocaleString()} so'm
                - Chiqim: ${totalExpense.toLocaleString()} so'm
                - Balans: ${balance.toLocaleString()} so'm
                - Eng katta harajat: ${Object.entries(categoryExpense).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'yo\'q'}
                
                Javoblaringizda quyidagi uslubda bering:
                1. Aniq raqamlar bilan
                2. Amaliy maslahat bilan
                3. Do'stona va motivatsion ohangda`
              },
              { role: 'user', content: userMessage }
            ]
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          return data.choices[0].message.content;
        } else {
          throw new Error('API xatosi');
        }
      } catch (error) {
        console.log('AI API xatosi, offline rejimga otildi:', error);
        return aiService.getOfflineResponse(userMessage, transactions);
      }
    }
    return aiService.getOfflineResponse(userMessage, transactions);
  },

  getOfflineResponse: (userMessage, transactions) => {
    const lowerMessage = userMessage.toLowerCase();
    
    const totalIncome = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0;
    const totalExpense = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0;
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    
    const categoryExpense = {};
    transactions?.filter(t => t.type === 'expense').forEach(t => {
      categoryExpense[t.category] = (categoryExpense[t.category] || 0) + t.amount;
    });
    const topCategory = Object.entries(categoryExpense).sort((a, b) => b[1] - a[1])[0];
    
    const responses = {
      'salom': `🤖 Salom! Men sizning shaxsiy moliyaviy AI yordamchingizman.\n\n📊 Hozirgi holatingiz:\n💰 Daromad: ${totalIncome.toLocaleString()} so'm\n💸 Chiqim: ${totalExpense.toLocaleString()} so'm\n⚖️ Balans: ${balance.toLocaleString()} so'm\n💪 Tejamkorlik: ${savingsRate.toFixed(1)}%\n\n❓ Qanday yordam bera olaman?`,
      
      'balans': `💰 Balansingiz: ${balance.toLocaleString()} so'm\n📈 Daromad: ${totalIncome.toLocaleString()} so'm\n📉 Chiqim: ${totalExpense.toLocaleString()} so'm\n\n${getAdvice(totalIncome, totalExpense, topCategory)}`,
      
      'daromad': `📈 Jami daromadingiz: ${totalIncome.toLocaleString()} so'm\n${savingsRate > 20 ? '🎉 Ajoyib jamg\'arma ko\'rsatkichi!' : '💪 Daromadingizni oshirish imkoniyatlarini qidiring.'}`,
      
      'chiqim': `💸 Jami chiqimingiz: ${totalExpense.toLocaleString()} so'm\n\n📊 Kategoriyalar bo'yicha tahlil:\n${getCategoryAnalysis(categoryExpense, totalExpense)}`,
      
      'eng kop': topCategory ? `🎯 Eng ko'p pul sarflangan kategoriya: ${topCategory[0]} - ${topCategory[1].toLocaleString()} so'm (${((topCategory[1]/totalExpense)*100).toFixed(1)}%)\n\n${getAdvice(totalIncome, totalExpense, topCategory)}` : "Hali hech qanday chiqim yo'q",
      
      'maslahat': getAdvice(totalIncome, totalExpense, topCategory),
      
      'tejamkorlik': `💡 Tejamkorlik maslahati:\n${getAdvice(totalIncome, totalExpense, topCategory)}\n\n✨ Qo'shimcha: ${getRandomTip()}`,
      
      'holat': `📊 **MOLIYAVIY HISOBOT**
━━━━━━━━━━━━━━━━━━━━━
💰 Daromad: ${totalIncome.toLocaleString()} so'm
💸 Chiqim: ${totalExpense.toLocaleString()} so'm
⚖️ Balans: ${balance.toLocaleString()} so'm
💪 Tejamkorlik: ${savingsRate.toFixed(1)}%
━━━━━━━━━━━━━━━━━━━━━
📋 Kategoriyalar:
${getCategoryAnalysis(categoryExpense, totalExpense)}
━━━━━━━━━━━━━━━━━━━━━
✨ ${getRandomTip()}`,
      
      'rahmat': "😊 Marhamat! Yana kerak bo'lsa, shu yerdaman. Moliyaviy muvaffaqiyatlar tilayman!",
      'xayr': "👋 Xayr! Moliyaviy maqsadlaringizga erishishingizga omad tilayman! 🌟",
      'yordam': `🤖 Men quyidagi buyruqlarni tushunaman:\n━━━━━━━━━━━━━━━━━━━━━\n💰 "Balans" - balansingizni ko'rsataman\n📈 "Daromad" - jami daromadingiz\n📉 "Chiqim" - jami chiqimingiz\n🎯 "Eng ko'p" - eng katta harajatingiz\n💡 "Maslahat" - tejamkorlik maslahati\n📊 "Holat" - to'liq hisobot\n✨ "Tejamkorlik" - maxsus maslahat\n\nSavolingizni yozing! 😊`
    };
    
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    
    // AI ga o'xshash dinamik javob
    if (lowerMessage.includes('qancha') || lowerMessage.includes('pul')) {
      return `💰 ${getMotivationalMessage(savingsRate)}\n\nBalansingiz: ${balance.toLocaleString()} so'm. Yana qanday savolingiz bor?`;
    }
    
    if (lowerMessage.includes('teja') || lowerMessage.includes('saqla')) {
      return `💡 ${getRandomTip()}\n\n${getAdvice(totalIncome, totalExpense, topCategory)}`;
    }
    
    if (!transactions || transactions.length === 0) {
      return "📭 Hozircha hech qanday tranzaksiya yo'q. Iltimos, avval kirim yoki chiqimlaringizni qo'shing, so'ngra savollaringizga javob bera olaman!\n\n💡 Masalan: 'Oziq-ovqat 50000 so'm' deb yozing.";
    }
    
    return `🤔 "${userMessage}" haqida so'rayapsiz.\n\n📋 Men quyidagi savollarga javob bera olaman:\n━━━━━━━━━━━━━━━━━━━━━\n💰 "Balans qancha?"\n📊 "Qayerga ko'p pul ketgan?"\n💡 "Tejamkorlik bo'yicha maslahat ber"\n📈 "Daromadim qancha?"\n📉 "Chiqimlarim qancha?"\n📊 "Holat" - to'liq hisobot\n\n❓ Qaysi birini bilmoqchisiz?`;
  },

  // Asosiy getResponse funksiyasi
  getResponse: async (userMessage, transactions) => {
    return await aiService.getRealAIResponse(userMessage, transactions);
  },
  
  getFinancialAdvice: (transactions) => {
    const totalIncome = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0;
    const totalExpense = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0;
    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    
    if (totalIncome === 0) {
      return "📝 Hali hech qanday daromad kiritilmagan. Iltimos, daromadlaringizni qo'shing!";
    }
    
    if (savingsRate < 10) {
      return `⚠️ Tejamkorlik darajangiz past (${savingsRate.toFixed(1)}% dan kam). ${getRandomTip()}`;
    } else if (savingsRate < 30) {
      return `✅ Yaxshi! Daromadingizning ${savingsRate.toFixed(1)}% ini jamg'armoqdasiz. Bu darajani saqlab qoling! ${getRandomTip()}`;
    } else {
      return `🌟 Ajoyib! Daromadingizning ${savingsRate.toFixed(1)}% dan ko'prog'ini jamg'armoqdasiz. Moliyaviy erkinlik sari to'g'ri ketyapsiz! 🚀`;
    }
  },
  
  analyzeSpending: (transactions) => {
    const categoryExpense = {};
    transactions?.filter(t => t.type === 'expense').forEach(t => {
      categoryExpense[t.category] = (categoryExpense[t.category] || 0) + t.amount;
    });
    
    const total = Object.values(categoryExpense).reduce((a, b) => a + b, 0);
    const advice = [];
    
    for (const [cat, amt] of Object.entries(categoryExpense)) {
      const percent = (amt / total) * 100;
      if (percent > 30) {
        advice.push(`⚠️ ${cat}ga juda ko'p pul ketmoqda (${percent.toFixed(1)}%). Shu kategoriyani qisqartirishga harakat qiling.`);
      }
    }
    
    if (advice.length === 0) {
      return "✅ Xarajatlaringiz yaxshi taqsimlangan. Shunday davom eting!";
    }
    
    return advice.join('\n');
  }
};

export default aiService;