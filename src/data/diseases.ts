// Guided symptom checker: per-crop decision trees for the most common
// diseases and pests in Uzbekistan's fields and orchards.
export interface DiagnosisResult {
  name: { uz: string; ru: string };
  treatment: { uz: string; ru: string };
  prevention: { uz: string; ru: string };
}

export interface TreeNode {
  question?: { uz: string; ru: string };
  options?: { label: { uz: string; ru: string }; next: TreeNode }[];
  result?: DiagnosisResult;
}

export const diseaseTrees: Record<string, TreeNode> = {
  cotton: {
    question: { uz: 'Asosiy belgini tanlang', ru: 'Выберите основной признак' },
    options: [
      {
        label: { uz: 'Barglar so‘liydi, sarg‘ayadi', ru: 'Листья вянут, желтеют' },
        next: {
          question: { uz: 'Poyani kesib ko‘ring — ichi qorayganmi?', ru: 'Срежьте стебель — потемнел ли он внутри?' },
          options: [
            {
              label: { uz: 'Ha, qoraygan', ru: 'Да, потемнел' },
              next: { result: {
                name: { uz: 'Vilt (verticillium so‘lishi)', ru: 'Вилт (вертициллёзное увядание)' },
                treatment: { uz: 'Kasallangan tuplarni yulib yoqing. Sug‘orishni me’yorlang — ortiqcha nam viltni kuchaytiradi. Tuproqqa trixoderma biopreparatini qo‘llang.', ru: 'Удалите и сожгите поражённые растения. Нормируйте полив — избыток влаги усиливает вилт. Внесите биопрепарат триходермы в почву.' },
                prevention: { uz: 'Chidamli navlar (S-6524 kabi), almashlab ekish (beda bilan), kuzgi shudgor.', ru: 'Устойчивые сорта (типа С-6524), севооборот с люцерной, зяблевая вспашка.' },
              } },
            },
            {
              label: { uz: 'Yo‘q, tiniq', ru: 'Нет, светлый' },
              next: { result: {
                name: { uz: 'Suv tanqisligi yoki ildiz zichlanishi', ru: 'Недостаток влаги или уплотнение почвы' },
                treatment: { uz: 'Sug‘orish oralig‘ini qisqartiring, qator orasini yumshating.', ru: 'Сократите интервал полива, прорыхлите междурядья.' },
                prevention: { uz: 'Tomchi ilovasidagi sug‘orish jadvaliga rioya qiling.', ru: 'Следуйте графику полива в приложении Томчи.' },
              } },
            },
          ],
        },
      },
      {
        label: { uz: 'Barg ostida mayda hasharotlar, yopishqoq iz', ru: 'Мелкие насекомые под листом, липкий налёт' },
        next: { result: {
          name: { uz: 'Shira (o‘simlik biti)', ru: 'Тля' },
          treatment: { uz: 'Oltinko‘z va xonqizi entomofaglarini qo‘llang. Kuchli tarqalganda insektitsid (imidakloprid) bilan kechki payt ishlov bering.', ru: 'Выпустите энтомофагов (златоглазка, божья коровка). При сильном заражении обработайте инсектицидом (имидаклоприд) вечером.' },
          prevention: { uz: 'Begona o‘tlarni yo‘qoting, azotni me’yorda bering.', ru: 'Уничтожайте сорняки, не перекармливайте азотом.' },
        } },
      },
      {
        label: { uz: 'Bargda oq to‘r, qizg‘ish dog‘lar', ru: 'Паутина на листьях, красноватые точки' },
        next: { result: {
          name: { uz: 'O‘rgimchakkana', ru: 'Паутинный клещ' },
          treatment: { uz: 'Akaritsid bilan ishlov bering (abamektin), 7–10 kundan keyin takrorlang. Barg ostiga puркang.', ru: 'Обработайте акарицидом (абамектин), повторите через 7–10 дней. Опрыскивайте нижнюю сторону листа.' },
          prevention: { uz: 'Chang bosgan quruq dalada kana ko‘payadi — yo‘l chetlarini sug‘orib turing.', ru: 'Клещ размножается в пыльных сухих местах — увлажняйте обочины.' },
        } },
      },
    ],
  },
  tomato: {
    question: { uz: 'Asosiy belgini tanlang', ru: 'Выберите основной признак' },
    options: [
      {
        label: { uz: 'Barg va mevada qo‘ng‘ir dog‘lar', ru: 'Бурые пятна на листьях и плодах' },
        next: { result: {
          name: { uz: 'Fitoftoroz (kech kuyish)', ru: 'Фитофтороз' },
          treatment: { uz: 'Kasallangan qismlarni olib tashlang. Mis preparatlari (bordo suyuqligi 1%) yoki mankozeb bilan ishlov bering. Kechqurun sug‘orishni to‘xtating.', ru: 'Удалите поражённые части. Обработайте медными препаратами (бордоская жидкость 1%) или манкоцебом. Прекратите вечерний полив.' },
          prevention: { uz: 'Tomchilatib sug‘oring — barg namligi kasallikni keltiradi. Navbatlab ekish.', ru: 'Поливайте капельно — влага на листьях провоцирует болезнь. Севооборот.' },
        } },
      },
      {
        label: { uz: 'Pastki barglar sarg‘ayib so‘liydi', ru: 'Нижние листья желтеют и вянут' },
        next: { result: {
          name: { uz: 'Fuzarioz so‘lishi', ru: 'Фузариозное увядание' },
          treatment: { uz: 'Kasallangan tupni ildizi bilan yo‘qoting. Qolganlarini trixoderma bilan sug‘oring.', ru: 'Удалите больное растение с корнем. Остальные пролейте триходермой.' },
          prevention: { uz: 'Chidamli duragaylar, tuproqni ekishdan oldin dezinfeksiya qiling.', ru: 'Устойчивые гибриды, обеззараживание почвы перед посадкой.' },
        } },
      },
      {
        label: { uz: 'Barg ostida oq mayda kapalaklar', ru: 'Белые мелкие бабочки под листом' },
        next: { result: {
          name: { uz: 'Oq qanot (belokrilka)', ru: 'Белокрылка' },
          treatment: { uz: 'Sariq yelim tuzoqlar osing. Kuchli zararlanishda tiametoksam bilan ishlov bering.', ru: 'Развесьте жёлтые клеевые ловушки. При сильном заражении — тиаметоксам.' },
          prevention: { uz: 'Issiqxonani shamollatib turing, begona o‘tlarni oling.', ru: 'Проветривайте теплицу, удаляйте сорняки.' },
        } },
      },
    ],
  },
  wheat: {
    question: { uz: 'Asosiy belgini tanlang', ru: 'Выберите основной признак' },
    options: [
      {
        label: { uz: 'Bargda zang rangli chiziqlar', ru: 'Ржавые полосы на листьях' },
        next: { result: {
          name: { uz: 'Sariq zang', ru: 'Жёлтая ржавчина' },
          treatment: { uz: 'Fungitsid bilan ishlov bering (propikonazol) — bayroq barg chiqishida eng samarali.', ru: 'Обработайте фунгицидом (пропиконазол) — эффективнее всего в фазе флаг-листа.' },
          prevention: { uz: 'Chidamli navlar, o‘z vaqtida ekish, azotni me’yorda berish.', ru: 'Устойчивые сорта, своевременный сев, умеренный азот.' },
        } },
      },
      {
        label: { uz: 'Bargda kulrang-jigarrang dog‘lar', ru: 'Серо-бурые пятна на листьях' },
        next: { result: {
          name: { uz: 'Septorioz', ru: 'Септориоз' },
          treatment: { uz: 'Triazol guruhidagi fungitsid qo‘llang, 2 haftadan keyin takrorlang.', ru: 'Примените фунгицид группы триазолов, повторите через 2 недели.' },
          prevention: { uz: 'Somonni yig‘ib oling, almashlab ekish.', ru: 'Уберите стерню, соблюдайте севооборот.' },
        } },
      },
    ],
  },
  grapes: {
    question: { uz: 'Asosiy belgini tanlang', ru: 'Выберите основной признак' },
    options: [
      {
        label: { uz: 'Barg va g‘ujumda oq un kabi qatlam', ru: 'Белый мучнистый налёт на листьях и гроздьях' },
        next: { result: {
          name: { uz: 'Oidium (un-shudring)', ru: 'Оидиум (мучнистая роса)' },
          treatment: { uz: 'Oltingugurt bilan changlang (25–30 kg/ga) yoki triadimefon puркang. Harorat 30°C dan past bo‘lganda ishlang.', ru: 'Опыление серой (25–30 кг/га) или опрыскивание триадимефоном. Работайте при температуре ниже 30°C.' },
          prevention: { uz: 'Tup ichini shamollatib xomtok qiling, ortiqcha novdalarni oling.', ru: 'Прореживайте куст для проветривания, удаляйте лишние побеги.' },
        } },
      },
      {
        label: { uz: 'Barg ustida yog‘li dog‘, ostida oq mog‘or', ru: 'Маслянистые пятна сверху, белый пушок снизу' },
        next: { result: {
          name: { uz: 'Mildyu', ru: 'Милдью' },
          treatment: { uz: 'Bordo suyuqligi 1% yoki metalaksil bilan ishlov bering — yomg‘irdan keyin darhol.', ru: 'Бордоская жидкость 1% или металаксил — сразу после дождя.' },
          prevention: { uz: 'Tomchilatib sug‘oring, bargga suv tegizmang.', ru: 'Капельный полив, не мочите листья.' },
        } },
      },
    ],
  },
  apple: {
    question: { uz: 'Asosiy belgini tanlang', ru: 'Выберите основной признак' },
    options: [
      {
        label: { uz: 'Barg va mevada qora-kulrang dog‘lar', ru: 'Тёмно-серые пятна на листьях и плодах' },
        next: { result: {
          name: { uz: 'Parsha (kalmaraz)', ru: 'Парша' },
          treatment: { uz: 'Gullashgacha va keyin fungitsid (difenokonazol) bilan 2 marta ishlov bering.', ru: 'Двукратная обработка фунгицидом (дифеноконазол) до и после цветения.' },
          prevention: { uz: 'Kuzda to‘kilgan barglarni yig‘ib yoqing, shox-shabbani siyraklang.', ru: 'Осенью соберите и сожгите опавшие листья, прореживайте крону.' },
        } },
      },
      {
        label: { uz: 'Mevada qurt yo‘li, chirish', ru: 'Ходы червя в плодах, гниль' },
        next: { result: {
          name: { uz: 'Olma qurti (mevaxo‘r)', ru: 'Яблонная плодожорка' },
          treatment: { uz: 'Feromon tuzoqlar o‘rnating. Kapalak uchishidan 7–10 kun o‘tib insektitsid puркang.', ru: 'Установите феромонные ловушки. Через 7–10 дней после лёта бабочек — инсектицид.' },
          prevention: { uz: 'Po‘stloq ostini tozalang, tutuvchi belbog‘lar qo‘ying.', ru: 'Очищайте кору, накладывайте ловчие пояса.' },
        } },
      },
    ],
  },
  melon: {
    question: { uz: 'Asosiy belgini tanlang', ru: 'Выберите основной признак' },
    options: [
      {
        label: { uz: 'Bargda oq un kabi dog‘lar', ru: 'Белые мучнистые пятна на листьях' },
        next: { result: {
          name: { uz: 'Un-shudring', ru: 'Мучнистая роса' },
          treatment: { uz: 'Oltingugurt asosidagi preparat bilan ishlov bering, 10 kundan keyin takrorlang.', ru: 'Обработка препаратом на основе серы, повтор через 10 дней.' },
          prevention: { uz: 'Qalin ekmang, palaklarni shamollatib turing.', ru: 'Не загущайте посевы, проветривайте плети.' },
        } },
      },
      {
        label: { uz: 'Palaklar birdan so‘liydi', ru: 'Плети внезапно вянут' },
        next: { result: {
          name: { uz: 'Fuzarioz so‘lishi', ru: 'Фузариозное увядание' },
          treatment: { uz: 'Kasallangan tupni yo‘qoting, qolganini trixoderma bilan sug‘oring.', ru: 'Удалите больной куст, остальные пролейте триходермой.' },
          prevention: { uz: '5–6 yillik almashlab ekish, chidamli navlar.', ru: 'Севооборот 5–6 лет, устойчивые сорта.' },
        } },
      },
    ],
  },
  potato: {
    question: { uz: 'Asosiy belgini tanlang', ru: 'Выберите основной признак' },
    options: [
      {
        label: { uz: 'Barglarda qo‘ng‘ir dog‘lar, nam chirish', ru: 'Бурые пятна на листьях, мокрая гниль' },
        next: { result: {
          name: { uz: 'Fitoftoroz', ru: 'Фитофтороз' },
          treatment: { uz: 'Mankozeb yoki mis preparatlari bilan ishlov bering. Kasallangan palakni yig‘ishtirib yoqing.', ru: 'Обработка манкоцебом или медными препаратами. Поражённую ботву скосите и сожгите.' },
          prevention: { uz: 'Sog‘lom urug‘lik, baland pushta, tomchilatib sug‘orish.', ru: 'Здоровый семенной материал, высокие гряды, капельный полив.' },
        } },
      },
      {
        label: { uz: 'Barglarni chizigli qo‘ng‘iz yeyapti', ru: 'Полосатый жук объедает листья' },
        next: { result: {
          name: { uz: 'Kolorado qo‘ng‘izi', ru: 'Колорадский жук' },
          treatment: { uz: 'Qo‘ng‘iz va lichinkalarni qo‘lda tering (kichik maydonda). Kuchli tarqalishda imidakloprid qo‘llang.', ru: 'Ручной сбор жуков и личинок (на малых площадях). При сильном заражении — имидаклоприд.' },
          prevention: { uz: 'Erta ekish, kartoshkani har yili boshqa joyga eking.', ru: 'Ранняя посадка, меняйте место посадки ежегодно.' },
        } },
      },
    ],
  },
};
