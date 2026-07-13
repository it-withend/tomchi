// Rotating agronomy tips shown on the loading splash — like a game's loading
// screen. Short, practical, farmer-facing. uz (default) + ru.
export const tips: { uz: string; ru: string }[] = [
  {
    uz: 'Ertalab yoki kechqurun sug‘oring — kunduzi suvning 30% gacha bug‘lanib ketadi.',
    ru: 'Поливайте утром или вечером — днём до 30% воды испаряется впустую.',
  },
  {
    uz: 'Tomchilatib sug‘orish egat usuliga qaraganda 40% gacha suv tejaydi.',
    ru: 'Капельный полив экономит до 40% воды по сравнению с арычным.',
  },
  {
    uz: 'Yomg‘irdan keyin sug‘orishni kutib turing — tuproq allaqachon nam.',
    ru: 'После дождя не спешите с поливом — почва уже увлажнена.',
  },
  {
    uz: 'Qator oralarini yumshatish suvni tuproqda uzoqroq saqlaydi.',
    ru: 'Рыхление междурядий помогает почве дольше удерживать влагу.',
  },
  {
    uz: 'Barglardagi dog‘larni erta payqang — kasallikni boshida davolash oson.',
    ru: 'Замечайте пятна на листьях рано — болезнь легче лечить в начале.',
  },
  {
    uz: 'Ortiqcha azot o‘simlikni kasallikka moyil qiladi. Me’yorida bering.',
    ru: 'Избыток азота делает растение уязвимым к болезням. Вносите в меру.',
  },
  {
    uz: 'Mulcha (somon qatlami) tuproqdagi namni saqlab, sug‘orishni kamaytiradi.',
    ru: 'Мульча (слой соломы) сохраняет влагу и сокращает число поливов.',
  },
  {
    uz: 'Qumloq tuproq suvni tez o‘tkazadi — tez-tez, oz-ozdan sug‘oring.',
    ru: 'Песчаная почва быстро пропускает воду — поливайте чаще и понемногу.',
  },
  {
    uz: 'Suvni tejash — Orol dengizini asrash. Har bir tomchi hisobda.',
    ru: 'Экономия воды — спасение Арала. Каждая капля на счету.',
  },
  {
    uz: 'Meva pishishidan 2 hafta oldin sug‘orishni kamaytiring — hosil shirinroq bo‘ladi.',
    ru: 'За 2 недели до созревания сократите полив — плоды будут слаще.',
  },
  {
    uz: 'Kasallangan o‘simlik qoldiqlarini yoqing — kasallik keyingi yilga o‘tmaydi.',
    ru: 'Сжигайте больные растительные остатки — болезнь не перейдёт на следующий год.',
  },
  {
    uz: 'Sug‘organingizni ilovada belgilang — keyingi sug‘orishni o‘zi eslatadi.',
    ru: 'Отмечайте поливы в приложении — оно само напомнит о следующем.',
  },
];

export function randomTip() {
  return tips[Math.floor(Math.random() * tips.length)];
}
