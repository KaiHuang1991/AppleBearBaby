/** Translated OEM buyer guides (slugs stay English). Internal hrefs are unprefixed; the patch script localizes them. */

const MOQ = 'moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles'
const SHIP = 'how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl'
const MAT = 'pp-vs-ppsu-vs-glass-baby-bottles-which-material-to-specify-in-an-oem-rfq'

const PP_812 = '/product/240ml-bpa-free-baby-feeding-bottle-with-silicone-nipple'
const PP_8005C =
  '/product/applebear-baby-feeding-bottles-set-with-bib-and-cotton-swabs-160ml-and-250ml-pp-nursing-bottles-with-easy-grip-handles-cute-cartoon-animals-print-infant-essentials-starter-gift-kit-for-boys-and-girls'
const PP_101 = '/product/ab-101-280ml-baby-feeding-bottle'
const GLASS_60 = '/product/applebear-60ml-standard-caliber-glass-baby-feeding-bottle-bpa-free-anti-colic'
const GLASS_120 =
  '/product/applebear-glass-feeding-bottle-120ml-premium-borosilicate-glass-baby-milk-bottle-with-silicone-nipple'
const GLASS_200 = '/product/applebear-glass-feeding-bottle-200ml-pure-and-gentle-for-your-little-one'

export const OEM_BLOG_I18N = {
  [MOQ]: {
    zh: {
      title: '起订量、样品与交期：下单奶瓶前该问什么',
      excerpt: '义乌工厂给 OEM 买家的清单：真实起订量、样品该要几件、从开模到整柜的交期——在发出奶瓶询盘之前先锁这三项。',
      content: `<p class="geo-answer">AppleBear Baby（浙江佑智，义乌）现有模具的库存 PP 奶瓶通常从一箱起订——例如 AB-101 为 144 只/箱。改色、贴牌印刷或礼盒包装可能把门槛提到数千只。完整询盘后 1–3 个工作日出报价；库存样品约 3–7 天可打包；样品确认后量产常见 15–25 天。请把询盘拆成库存、印刷、礼盒三条，每条起订量才可执行。</p>
<h2>先锁商务条件，不要只发产品图</h2>
<p>多数首次询盘只写容量和颜色。只有同时锁定起订量、样品包含什么、样品确认到装柜之间有多少个日历日，报价才有用。本文是 AppleBear Baby（浙江佑智，义乌）对 OEM/批发买家的答复方式。</p>
<p>applebearbaby.net 是品牌总部。若已在阿里巴巴采购，同一工厂也接 ywyouzhi.en.alibaba.com 的询盘——那是销售渠道，不是第二个品牌。</p>
<h2>起订量：问真正的瓶颈</h2>
<p>奶瓶起订量很少是“一箱了事”，通常取较大者：（1）瓶身注塑/吹塑批次；（2）硅胶奶嘴或牙盖配色；（3）彩盒或套筒印刷最低量。目录上看似库存的 240ml PP 瓶，若要在套筒上印您的 logo，印刷起订仍可能是数千只。</p>
<p>写询盘时请拆数量：</p>
<ul>
<li>库存颜色 / 库存印刷——在产型号往往可从较低箱数起订。</li>
<li>定制颜色或贴牌印刷——由印刷或色母最低量决定门槛。</li>
<li>礼盒（奶瓶+围兜+刷）——起订跟最慢的配件走，不是只跟瓶子。</li>
</ul>
<p>若只需 500–1,000 只试市场，请直接说明。我们会告知这是样品价、混箱试单，还是该模具不经济。</p>
<h2>样品：开模前该要什么</h2>
<p>有用的样品不是一只好看的瓶子。请要：</p>
<ul>
<li>将采购的树脂（PP 或玻璃）瓶身，以及口径（标口或宽口）。</li>
<li>将销售的硅胶等级与孔径的奶嘴。</li>
<li>牙盖、手柄及礼盒附件，同一色系。</li>
<li>出口外箱唛头与内包装照片，便于仓库规划。</li>
</ul>
<p>义乌样品通常走中国邮政小包、阿里国际快递或 DHL / FedEx / TNT。运费随样品报价，不是零售包邮。若之后改模具或印版，视为新样品——不要假设第一件快递就是量产标准。</p>
<h2>交期：样品、量产与海运</h2>
<p>现有模具的在产 PP 瓶，较现实的日历是：</p>
<ul>
<li>报价与装箱单：完整询盘（型号、树脂、数量、印刷、目的港）后 1–3 个工作日。</li>
<li>库存或近库存样品：约 3–7 天打包，另加快递在途。</li>
<li>样品确认后量产：常见 15–25 天，视产线与印刷。</li>
<li>海运整柜/拼柜：再加航线（目的地常 18–45 天）。空运更快，单独报价。</li>
</ul>
<p>新模具、新硅胶模或整套礼盒改版时间更长。模具交期请单列——不要埋在“生产 20 天”里。</p>
<h2>PP 与玻璃、欧盟与美国——写进同一询盘</h2>
<p>检测由树脂和市场决定，不只是价格。PP 是礼盒与带手柄瓶的日常 OEM 主力，也是我们的主线。我们也做高硼硅玻璃（60ml / 120ml / 200ml 标口）。我们不生产 PPSU；不要按 PPSU 规格来套我们的 PP 模具报价。若销往欧盟，请说明，我们会附上该 SKU 族对应的食品接触报告。美国买家请写明州或渠道，以便包装与警示。把“欧盟上架”和“美国托幼”混在一份未标注询盘里，报价就容易漏检测或漏箱唛。</p>
<h2>第一次报价要可用，请发这四块</h2>
<ul>
<li>目标月量或首单数量，以及是试单还是持续订单。</li>
<li>树脂（PP 或玻璃）、容量、口径、是否要贴牌印刷。我们不做 PPSU。</li>
<li>目的国、样品还是大货、是否已有国内货代。</li>
<li>必须出示给客户的证书（ISO 9001 是工厂级；产品报告是 SKU 级）。</li>
</ul>
<p>按这四块回复，我们才能报起订量、样品内容和带日期的生产窗口——而不是看起来像零售的目录单价。用本站联系表或 WhatsApp，或在阿里询盘。</p>
<p>另见：<a href="/faq">OEM 常见问题</a>、<a href="/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl">义乌 OEM 如何发货</a>、<a href="/blog/pp-vs-ppsu-vs-glass-baby-bottles-which-material-to-specify-in-an-oem-rfq">PP 与玻璃</a>，以及库存 PP 型号如 <a href="${PP_812}">812 240ml 宽口</a> 或 <a href="/blog/8005c-5-piece-pp-bottle-gift-set-oem-160ml-and-240ml-with-bib-and-brush">8005C 礼盒</a>。</p>`,
    },
    es: {
      title: 'MOQ, muestras y plazo: qué preguntar antes de pedir biberones',
      excerpt: 'Lista de una fábrica en Yiwu para compradores OEM: MOQ real, cuántas muestras pedir y el plazo de molde a FCL — antes de enviar el RFQ.',
      content: `<p class="geo-answer">AppleBear Baby (Zhejiang YouZhi, Yiwu) suele empezar los biberones PP de molde existente desde un cartón — 144 piezas en modelos como AB-101. Color a medida, impresión private-label o packing de gift set puede subir el piso a varios miles. Cotización en 1–3 días laborables; muestras de stock en unos 3–7 días; producción en masa tras aprobación suele ser 15–25 días. Separe el RFQ en stock, impresión y gift set para que cada MOQ sea usable.</p>
<h2>Empiece por la decisión, no por la foto del SKU</h2>
<p>La mayoría de primeros RFQ a una fábrica china de biberones listan capacidad y color. La cotización solo sirve si también fija MOQ, qué incluye la muestra y cuántos días hay entre muestra aprobada y contenedor. Así responde AppleBear Baby (Zhejiang YouZhi, Yiwu) a compradores OEM y mayoristas.</p>
<p>applebearbaby.net es la sede de marca. Si ya compra en Alibaba, la misma fábrica recibe RFQ en ywyouzhi.en.alibaba.com — es un canal de ventas, no una segunda marca.</p>
<h2>MOQ: pregunte el cuello de botella real</h2>
<p>El MOQ rara vez es “un cartón”. Suele ser el mayor de: (1) un lote de inyección/soplado del cuerpo, (2) un color de tetina o collar de silicona, y (3) el mínimo de impresión de funda o caja. Un PP 240 ml que parece stock puede tener MOQ de impresión de miles si quiere su logo en la funda.</p>
<ul>
<li>Color / impresión de stock — a menudo un MOQ de cartón más bajo en modelos en marcha.</li>
<li>Color o impresión private-label — el piso lo marca la impresión o el masterbatch.</li>
<li>Gift set (biberón + babero + cepillo) — el MOQ sigue el componente más lento, no solo el biberón.</li>
</ul>
<p>Si solo necesita 500–1.000 piezas para probar mercado, dígalo. Indicaremos si es precio de muestra, prueba en cartón mixto o no es económico en ese molde.</p>
<h2>Muestras: qué pedir antes de aprobar un molde</h2>
<ul>
<li>Cuerpo en la resina que comprará (PP o vidrio) y el cuello (estándar o ancho).</li>
<li>Tetina en el grado de silicona y el orificio que venderá.</li>
<li>Collar, asa y extras del gift set en la misma familia de color.</li>
<li>Marcas del cartón de exportación y foto del packing interior.</li>
</ul>
<p>Las muestras desde Yiwu suelen ir por China Post, Alibaba express o DHL / FedEx / TNT. El flete se cotiza con la muestra. Si cambia el molde o la plancha, es una muestra nueva.</p>
<h2>Plazo: muestra, producción y océano</h2>
<ul>
<li>Cotización y packing list: 1–3 días laborables tras un RFQ completo.</li>
<li>Muestra de stock: unos 3–7 días para empacar, más tránsito.</li>
<li>Producción en masa tras aprobación: suele 15–25 días.</li>
<li>FCL/LCL marítimo: sume la ruta (a menudo 18–45 días). Aéreo aparte.</li>
</ul>
<p>Moldes nuevos, herramientas de silicona o un gift set rediseñado van en un reloj más largo. Pida el plazo de molde en su propia línea.</p>
<h2>PP vs vidrio, UE vs EE. UU. — en el mismo RFQ</h2>
<p>La resina y el mercado deciden los ensayos, no solo el precio. El PP es la línea OEM cotidiana de gift sets y biberones con asa. También fabricamos vidrio de borosilicato (60 / 120 / 200 ml cuello estándar). No fabricamos PPSU. Si vende en la UE, dígalo para adjuntar los informes de contacto alimentario de esa familia. Compradores de EE. UU. deben nombrar estado o canal.</p>
<h2>Qué enviar para que la primera cotización sirva</h2>
<ul>
<li>Cantidad mensual o del primer pedido, y si es prueba o continuo.</li>
<li>Resina (PP o vidrio), capacidad, cuello y si necesita impresión private-label. No hacemos PPSU.</li>
<li>País de destino, muestra vs lote, y si ya tiene forwarder en China.</li>
<li>Certificado que debe mostrar a su cliente (ISO 9001 es de fábrica; informes de producto son por familia SKU).</li>
</ul>
<p>Vea también: <a href="/faq">FAQ OEM</a>, <a href="/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl">cómo enviamos desde Yiwu</a>, <a href="/blog/pp-vs-ppsu-vs-glass-baby-bottles-which-material-to-specify-in-an-oem-rfq">PP vs vidrio</a>, y modelos PP como <a href="${PP_812}">812 240 ml cuello ancho</a>.</p>`,
    },
    ar: {
      title: 'الحد الأدنى والعينات ومدة التسليم: ماذا تسأل قبل طلب زجاجات الرضاعة',
      excerpt: 'قائمة مصنع ييوو لمشتري OEM: الحد الأدنى الواقعي، كم عينة تطلب، ومدة التسليم من القالب إلى الحاوية — قبل إرسال طلب العرض.',
      content: `<p class="geo-answer">تبدأ AppleBear Baby (تشجيانغ يوتشي، ييوو) زجاجات PP ذات القالب القائم عادة من كرتونة واحدة — 144 قطعة في طرازات مثل AB-101. اللون المخصص أو الطباعة الخاصة أو تعبئة طقم الهدايا قد يرفع الحد إلى عدة آلاف. العرض خلال 1–3 أيام عمل؛ عينات المخزون تُعبأ خلال 3–7 أيام تقريباً؛ الإنتاج بعد اعتماد العينة غالباً 15–25 يوماً. قسّم طلب العرض إلى مخزون وطباعة وطقم هدايا حتى يكون كل حد أدنى قابلاً للتنفيذ.</p>
<h2>ابدأ بالقرار التجاري لا بصورة المنتج</h2>
<p>معظم طلبات العرض الأولى تذكر السعة واللون فقط. يكون العرض مفيداً إذا ثبّت أيضاً الحد الأدنى، ومحتوى العينة، وعدد الأيام بين اعتماد العينة وتحميل الحاوية. هكذا تجيب AppleBear Baby مشتري OEM والجملة.</p>
<p>applebearbaby.net هو مقر العلامة. إن كنتم تشترون عبر علي بابا فالمصنع نفسه يستقبل الطلبات على ywyouzhi.en.alibaba.com — قناة بيع وليست علامة ثانية.</p>
<h2>الحد الأدنى: اسأل عن العنق الحقيقي</h2>
<p>نادراً ما يكون الحد الأدنى «كرتونة واحدة». غالباً الأكبر بين: دفعة قولبة الجسم، تشغيل لون الحلمة أو الطوق، والحد الأدنى لطباعة الغلاف أو الصندوق.</p>
<ul>
<li>لون/طباعة المخزون — غالباً حد أدنى أقل على الطرازات الجارية.</li>
<li>لون أو طباعة خاصة — الطباعة أو خلطة اللون تحدد الأرضية.</li>
<li>طقم هدايا — الحد يتبع أبطأ مكوّن لا الزجاجة وحدها.</li>
</ul>
<p>إن احتجتم 500–1000 قطعة لاختبار السوق، قولوا ذلك.</p>
<h2>العينات قبل اعتماد القالب</h2>
<ul>
<li>جسم الزجاجة بالراتنج الذي ستشترونه (PP أو زجاج) ونوع العنق.</li>
<li>الحلمة بدرجة السيليكون وفتحة التدفق التي ستبيعونها.</li>
<li>الطوق والمقبض وإضافات الطقم بنفس عائلة اللون.</li>
<li>علامات كرتون التصدير وصورة التعبئة الداخلية.</li>
</ul>
<p>عينات ييوو عادة عبر البريد الصيني أو علي بابا إكسبرس أو DHL / FedEx / TNT. الشحن يُسعَّر مع العينة.</p>
<h2>مدة التسليم</h2>
<ul>
<li>العرض وقائمة التعبئة: 1–3 أيام عمل بعد طلب كامل.</li>
<li>عينة مخزون: نحو 3–7 أيام للتعبئة ثم التوصيل.</li>
<li>الإنتاج بعد الاعتماد: غالباً 15–25 يوماً.</li>
<li>بحري FCL/LCL: أضيفوا المسار (غالباً 18–45 يوماً). الجوّي منفصل.</li>
</ul>
<p>قوالب جديدة أو طقم هدايا معاد تصميمه أطول. اطلبوا مدة القالب سطراً مستقلاً.</p>
<h2>PP مقابل الزجاج، الاتحاد الأوروبي مقابل الولايات المتحدة</h2>
<p>الراتنج والسوق يحددان الاختبارات لا السعر فقط. PP هو خط OEM اليومي للمجموعات والزجاجات بمقبض. نصنع أيضاً زجاج البوروسيليكات (60 / 120 / 200 مل عنق قياسي). لا ننتج PPSU. إن كان البيع للاتحاد الأوروبي قولوا ذلك لنرفق تقارير ملامسة الغذاء.</p>
<h2>ما ترسلونه ليكون العرض الأول قابلاً للاستخدام</h2>
<ul>
<li>الكمية الشهرية أو الأولى، وهل هي تجربة أم مستمرة.</li>
<li>الراتنج (PP أو زجاج) والسعة والعنق وهل تحتاجون طباعة خاصة. لا نصنع PPSU.</li>
<li>بلد الوجهة، عينة أم كمية، وهل لديكم وكيل شحن في الصين.</li>
<li>أي شهادة يجب إظهارها للعميل (ISO 9001 على مستوى المصنع).</li>
</ul>
<p>انظر أيضاً: <a href="/faq">أسئلة OEM</a>، <a href="/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl">كيف نشحن من ييوو</a>، <a href="/blog/pp-vs-ppsu-vs-glass-baby-bottles-which-material-to-specify-in-an-oem-rfq">PP مقابل الزجاج</a>.</p>`,
    },
    fr: {
      title: 'MOQ, échantillons et délai : que demander avant de commander des biberons',
      excerpt: 'Liste d’une usine à Yiwu pour acheteurs OEM : MOQ réel, combien d’échantillons demander, et le délai du moule au FCL — avant l’RFQ.',
      content: `<p class="geo-answer">AppleBear Baby (Zhejiang YouZhi, Yiwu) démarre en général les biberons PP sur moule existant à partir d’un carton — 144 pièces sur des modèles comme AB-101. Couleur sur mesure, impression private-label ou packing coffret peut relever le plancher à plusieurs milliers. Devis en 1–3 jours ouvrés ; échantillons stock en 3–7 jours environ ; production après validation souvent 15–25 jours. Séparez l’RFQ en stock, impression et coffret pour que chaque MOQ soit utilisable.</p>
<h2>Commencez par la décision, pas par la photo SKU</h2>
<p>La plupart des premiers RFQ indiquent capacité et couleur. Le devis ne sert que si vous figez aussi le MOQ, le contenu de l’échantillon et les jours calendaires entre échantillon validé et conteneur. C’est ainsi qu’AppleBear Baby répond aux acheteurs OEM et gros.</p>
<p>applebearbaby.net est le siège de marque. Si vous achetez déjà sur Alibaba, la même usine prend les RFQ sur ywyouzhi.en.alibaba.com — un canal de vente, pas une seconde marque.</p>
<h2>MOQ : demandez le vrai goulot</h2>
<p>Le MOQ est rarement « un carton ». C’est en général le plus élevé de : (1) un lot d’injection/soufflage du corps, (2) une teinte de tétine ou collier silicone, (3) le minimum d’impression manchon ou coffret.</p>
<ul>
<li>Couleur / impression stock — souvent un MOQ carton plus bas sur modèles en cours.</li>
<li>Couleur ou impression private-label — l’impression ou le masterbatch fixe le plancher.</li>
<li>Coffret (biberon + bavoir + brosse) — le MOQ suit le composant le plus lent.</li>
</ul>
<p>Si vous n’avez besoin que de 500–1 000 pièces pour tester un marché, dites-le.</p>
<h2>Échantillons avant d’approuver un moule</h2>
<ul>
<li>Corps dans la résine que vous achèterez (PP ou verre) et le col (standard ou large).</li>
<li>Tétine dans le grade silicone et le débit que vous vendrez.</li>
<li>Collier, anse et extras du coffret dans la même famille de couleur.</li>
<li>Marquage carton export et photo du packing intérieur.</li>
</ul>
<p>Les échantillons depuis Yiwu partent en général par China Post, Alibaba express ou DHL / FedEx / TNT. Le fret est coté avec l’échantillon.</p>
<h2>Délai : échantillon, production et mer</h2>
<ul>
<li>Devis et packing list : 1–3 jours ouvrés après RFQ complet.</li>
<li>Échantillon stock : environ 3–7 jours pour emballer, plus transit.</li>
<li>Production après validation : souvent 15–25 jours.</li>
<li>FCL/LCL mer : ajoutez la ligne (souvent 18–45 jours). Air à part.</li>
</ul>
<p>Nouveaux moules, outils silicone ou coffret redessiné : délai plus long. Demandez le délai moule sur sa propre ligne.</p>
<h2>PP vs verre, UE vs États-Unis — dans le même RFQ</h2>
<p>La résine et le marché décident des essais, pas seulement le prix. Le PP est la ligne OEM quotidienne des coffrets et biberons à anse. Nous faisons aussi du verre borosilicate (60 / 120 / 200 ml col standard). Nous ne fabriquons pas de PPSU. Si vous vendez en UE, dites-le pour joindre les rapports de contact alimentaire de cette famille.</p>
<h2>Quoi envoyer pour un premier devis utilisable</h2>
<ul>
<li>Quantité mensuelle ou de première commande, essai ou continu.</li>
<li>Résine (PP ou verre), capacité, col, impression private-label ou non. Pas de PPSU.</li>
<li>Pays de destination, échantillon vs lot, transitaire Chine déjà en place ou non.</li>
<li>Certificat à montrer au client (ISO 9001 usine ; rapports produit au niveau famille SKU).</li>
</ul>
<p>Voir aussi : <a href="/faq">FAQ OEM</a>, <a href="/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl">comment nous expédions depuis Yiwu</a>, <a href="/blog/pp-vs-ppsu-vs-glass-baby-bottles-which-material-to-specify-in-an-oem-rfq">PP vs verre</a>.</p>`,
    },
  },
  [SHIP]: {
    zh: {
      title: '义乌 OEM 如何发货：您的国内货代、阿里物流或整柜',
      excerpt: '义乌工厂三种发货模式：送到您指定的国内仓库并保留签收单；无货代时按箱数/体积/重量在阿里物流询空运海运快递；整柜可由阿里货代或您指定船公司，空箱到厂装箱人工由工厂承担。可在本站跟踪快递单号。',
      content: `<p class="geo-answer">AppleBear Baby 从义乌发 OEM 订单有三种模式：把打好的纸箱送到您货代指定的国内仓库并保留签收单；若没有货代，我们按箱数、体积（CBM）和毛重在阿里物流询空运、海运（拼柜/整柜）或快递；整柜可用阿里货代或您自己的船公司，空箱到厂装箱时工厂承担装柜人工。快递单号可贴到 <a href="/shipping#track">物流跟踪</a>。</p>
<h2>先选交货模式，再要运费表</h2>
<p>首次询盘常写“请报 CIF”，却没有箱数、体积、谁持有出口文件。运费不是目录行：取决于谁管国内货代、多少箱、是快递、拼柜还是整柜。本文是 AppleBear Baby（浙江佑智，义乌）实际发 OEM/批发货的方式——与 <a href="/shipping">物流页</a> 三种模式相同。</p>
<p>applebearbaby.net 是品牌总部。阿里巴巴店是销售渠道，不是第二家物流公司。</p>
<h2>1. 您已有国内货代</h2>
<p>这是最干净的交接。您（或进口商）指定已在中国有仓的货代——通常在义乌、宁波或上海。工厂负责国内：打包、送到指定仓、拿到签收。</p>
<ul>
<li>您提供仓库名、地址、联系人及他们要求的订舱号或唛头。</li>
<li>我们送箱到该门口。此模式下除非另行要求，我们不订海运或空运。</li>
<li>送达后您得到仓单/签收（POD）：日期、箱数、签收人。请与装箱单一起保存，这是工厂与货代的交接点。</li>
</ul>
<p>报关、提单、目的港清关在签收之后由货代负责。若货代仓尚未指定，请在询盘中说明——我们不会编造一份假设我们持有文件的 CIF 价。</p>
<h2>2. 没有国内货代——走阿里物流</h2>
<p>许多首次 OEM 买家在中国没有货代。我们不会从聊天截图猜快递。我们按箱数、体积和毛重，在阿里物流中心找兼顾时效与费用的线路。</p>
<ul>
<li>国际快递——DHL、FedEx、TNT 等，用于样品和紧急小批量。</li>
<li>空运——超过信封但仍要按天而不是按周。</li>
<li>海运——拼柜混箱；体积够则整柜。在途更长，单件成本通常更低。</li>
</ul>
<p>没有“唯一最好”的线路。20 公斤样品到欧洲，和 12 CBM PP 瓶到美国仓，是两个问题。我们给出时效与运费选项，您选平衡。运费随订单报价，不是零售包邮，也不是无视目的地的公开价卡。</p>
<h2>3. 整柜：阿里货代、您的船公司或工厂装柜</h2>
<ul>
<li>由阿里侧货代订合适船期的柜子。</li>
<li>指定您自己的船公司/指定承运人。我们配合该订舱，不强迫用我们伙伴的船。</li>
<li>只做内陆拖车：送到货代指定的 CY、CFS 或仓库——与模式 1 相同，只是整柜规模。</li>
<li>空箱送到工厂。货代或船公司把箱子放到门口，我们装箱。<strong>厂内装柜人工由工厂承担</strong>——不会在这里装柜时突然加一笔装卸工费用。</li>
</ul>
<p>询盘里写清要哪一种。把“请订整柜”和“货代下周二送箱”写在同一条消息里，船期就会滑。</p>
<h2>在本站跟踪</h2>
<p>样品或快递生产批离开义乌后，发货通知会带单号。可贴到 <a href="/shipping#track">物流跟踪</a>。</p>
<ul>
<li>选择中国邮政 / EMS、DHL、FedEx、TNT，或不确定时用自动识别（17TRACK）。</li>
<li>表单打开承运人自己的查询页。我们不在服务器上保存单号。</li>
<li>海运不用这个框。整柜/拼柜在提单或货代系统里查。</li>
</ul>
<p>另见：<a href="/faq">OEM 常见问题</a>、<a href="/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles">起订量、样品与交期</a>、<a href="/shipping">工厂物流与退货</a>。</p>`,
    },
    es: {
      title: 'Cómo enviamos pedidos OEM desde Yiwu: su agente en China, Alibaba logistics o FCL',
      excerpt: 'Tres modelos desde Yiwu: entregar al almacén de su agente con POD; sin agente, cotizar aire/mar/express en Alibaba logistics; o FCL — y cómo rastrear en applebearbaby.net.',
      content: `<p class="geo-answer">AppleBear Baby envía pedidos OEM desde Yiwu en tres modelos: entregar cartones al almacén en China que nombre su agente y guardar el POD firmado; si no tiene agente, cotizamos aire, mar (LCL/FCL) o express en Alibaba logistics según cartones, CBM y peso; un contenedor completo puede usar socios Alibaba o su línea, con mano de obra de stuffing en fábrica si el vacío se carga en planta. Pegue números de courier en el <a href="/shipping#track">rastreador</a>.</p>
<h2>No pida una tarifa de flete antes de elegir el modelo</h2>
<p>Un primer RFQ suele decir “coticen CIF” sin cartones, sin CBM y sin quién tiene el expediente de exportación. El flete no es una línea de catálogo. Sigue a quién posee el agente en China, cuántos cartones mueve y si es paquete courier, palé LCL o contenedor. Así envía AppleBear Baby — los mismos tres modelos de la <a href="/shipping">página de envío</a>.</p>
<h2>1. Ya tiene agente de envío en China</h2>
<p>Es el traspaso más limpio. Usted nombra un forwarder con almacén en China — suele ser Yiwu, Ningbo o Shanghái. Nuestro trabajo es doméstico: empacar, camionar al almacén que indiquen y obtener recibo firmado.</p>
<ul>
<li>Envíe nombre, dirección, contacto y marcas o booking que pidan.</li>
<li>Entregamos los cartones a esa puerta. En este modelo no reservamos océano ni aire salvo que lo pida aparte.</li>
<li>Tras la entrega recibe POD: fecha, número de cartones y quién firmó.</li>
</ul>
<p>Declaración de exportación, BL y despacho en destino quedan con su agente después de ese recibo.</p>
<h2>2. No tiene agente en China — reservamos en Alibaba logistics</h2>
<ul>
<li>Express internacional — DHL, FedEx, TNT para muestras y lotes urgentes.</li>
<li>Aéreo — cuando el volumen supera un sobre pero aún necesita días, no semanas.</li>
<li>Marítimo — LCL para cartones mixtos; FCL cuando el cubo llena un contenedor.</li>
</ul>
<p>No hay una sola “mejor” vía. Un pack de 20 kg a Europa no es el mismo problema que 12 CBM de PP a un almacén en EE. UU. El flete se cotiza con el pedido.</p>
<h2>3. Contenedor completo (FCL)</h2>
<ul>
<li>Que el forwarder de Alibaba reserve el contenedor.</li>
<li>Nombre su propia línea. Cooperamos con esa reserva.</li>
<li>Solo trucking interior: entregamos al CY, CFS o almacén que nombre su forwarder.</li>
<li>Envíe el contenedor vacío a la fábrica. Lo estibamos. <strong>La mano de obra de carga en planta corre por nuestra cuenta</strong>.</li>
</ul>
<h2>Rastrear en este sitio</h2>
<p>Pegue el número en <a href="/shipping#track">el rastreador</a>. Marítimo no usa esa caja: se rastrea en el BL o el portal del forwarder.</p>
<p>Vea también: <a href="/faq">FAQ OEM</a>, <a href="/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles">MOQ, muestras y plazo</a>, <a href="/shipping">envío y devoluciones</a>.</p>`,
    },
    ar: {
      title: 'كيف نشحن طلبات OEM من ييوو: وكيلكم في الصين أو لوجستيات علي بابا أو حاوية كاملة',
      excerpt: 'ثلاثة نماذج شحن من ييوو: التسليم إلى مستودع وكيلكم مع إيصال؛ بدون وكيل نسعّر الجو/البحر/السريع عبر علي بابا؛ أو حاوية كاملة — وتتبع الشحنة على الموقع.',
      content: `<p class="geo-answer">تشحن AppleBear Baby طلبات OEM من ييوو بثلاثة نماذج: تسليم الكراتين إلى مستودع الصين الذي يسمّيه وكيلكم مع حفظ إيصال التسليم؛ إن لم يكن لديكم وكيل نسعّر الجو أو البحر (LCL/FCL) أو السريع عبر لوجستيات علي بابا حسب عدد الكراتين والحجم والوزن؛ الحاوية الكاملة يمكن أن تستخدم شركاء علي بابا أو خطكم، وعمالة التحميل في المصنع علينا إذا حُمّلت الحاوية الفارغة في المصنع. الصقوا أرقام البريد السريع في <a href="/shipping#track">أداة التتبع</a>.</p>
<h2>لا تطلبوا جدول شحن قبل اختيار نموذج التسليم</h2>
<p>الشحن ليس بند كتالوج. يتبع من يملك وكيل الصين وكم كرتونة تتحركون وهل هي طرد سريع أو LCL أو حاوية.</p>
<h2>1. لديكم وكيل شحن في الصين</h2>
<p>عملنا محلي: التعبئة والنقل إلى المستودع الذي يسمّونه وإيصال موقّع. الإقرار الجمركي وبوليصة الشحن والتخليص عند الوجهة بعد الإيصال لدى وكيلكم.</p>
<h2>2. لا وكيل في الصين — نحجز عبر علي بابا</h2>
<ul>
<li>بريد سريع دولي — DHL وFedEx وTNT للعينات والكميات العاجلة.</li>
<li>جوي — عندما يتجاوز الحجم ظرفاً وما زلتم تحتاجون أياماً لا أسابيع.</li>
<li>بحري — LCL للكراتين المختلطة؛ FCL عندما يملأ الحجم حاوية.</li>
</ul>
<h2>3. حاوية كاملة</h2>
<ul>
<li>وكيل علي بابا يحجز الحاوية.</li>
<li>تعيّنون خطكم ونتعاون مع ذلك الحجز.</li>
<li>نقل داخلي فقط إلى CY أو CFS أو مستودع الوكيل.</li>
<li>حاوية فارغة إلى المصنع نحمّلها. <strong>عمالة التحميل في المصنع علينا</strong>.</li>
</ul>
<p>انظر أيضاً: <a href="/faq">أسئلة OEM</a>، <a href="/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles">الحد الأدنى والعينات</a>، <a href="/shipping">الشحن والإرجاع</a>.</p>`,
    },
    fr: {
      title: 'Comment nous expédions les commandes OEM depuis Yiwu : votre agent Chine, Alibaba logistics ou FCL',
      excerpt: 'Trois modèles depuis Yiwu : livrer à l’entrepôt de votre agent avec POD ; sans agent, coter air/mer/express sur Alibaba logistics ; ou FCL — et le suivi sur applebearbaby.net.',
      content: `<p class="geo-answer">AppleBear Baby expédie les commandes OEM depuis Yiwu en trois modèles : livrer les cartons à l’entrepôt Chine nommé par votre agent et garder le POD signé ; sans agent, nous cotons air, mer (LCL/FCL) ou express sur Alibaba logistics selon cartons, CBM et poids ; un FCL peut utiliser des partenaires Alibaba ou votre ligne, avec la main-d’œuvre de stuffing usine si le vide est chargé à l’usine. Collez les numéros courier sur le <a href="/shipping#track">suivi</a>.</p>
<h2>Ne demandez pas une grille de fret avant le modèle de livraison</h2>
<p>Le fret n’est pas une ligne catalogue. Il suit qui possède l’agent Chine, combien de cartons, et si c’est un colis, un LCL ou un conteneur. Ce sont les trois modèles de la <a href="/shipping">page expédition</a>.</p>
<h2>1. Vous avez déjà un agent en Chine</h2>
<p>Notre travail est domestique : emballer, camionner à l’entrepôt nommé, obtenir un reçu signé. Export, BL et dédouanement destination restent chez votre agent après ce reçu.</p>
<h2>2. Pas d’agent Chine — réservation Alibaba logistics</h2>
<ul>
<li>Express international — DHL, FedEx, TNT pour échantillons et petits lots urgents.</li>
<li>Aérien — volume au-delà d’une enveloppe, délai en jours.</li>
<li>Maritime — LCL cartons mixtes ; FCL quand le cube remplit un box.</li>
</ul>
<h2>3. Conteneur complet (FCL)</h2>
<ul>
<li>Le transitaire Alibaba réserve le conteneur.</li>
<li>Vous nommez votre ligne ; nous coopérons avec cette réservation.</li>
<li>Trucking intérieur seulement vers CY, CFS ou entrepôt nommé.</li>
<li>Conteneur vide à l’usine : nous le chargeons. <strong>La main-d’œuvre de chargement usine est à notre charge</strong>.</li>
</ul>
<p>Voir aussi : <a href="/faq">FAQ OEM</a>, <a href="/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles">MOQ, échantillons et délai</a>, <a href="/shipping">expédition et retours</a>.</p>`,
    },
  },
  [MAT]: {
    zh: {
      title: 'PP 与玻璃奶瓶：OEM 询盘该写哪种材料',
      excerpt: '义乌 AppleBear Baby 以 PP 为主线，另有高硼硅玻璃。我们不生产 PPSU。本文说明询盘该写哪种瓶身材料，以及对应目录型号。',
      content: `<p class="geo-answer">义乌 AppleBear Baby 的瓶身材料是食品级 PP（礼盒与批量批发的主 OEM 线）和高硼硅玻璃（60ml、120ml、200ml 标口）。我们不用 PPSU，也不把 PPSU 当材料升级来报价。812、8005C 等 PP 型号是目录主力。请把 PP 或玻璃与数量、目的地写在同一条询盘里——PPSU 招标不是我们做的 SKU。</p>
<h2>询盘写树脂，不要只附图</h2>
<p>PP 与玻璃不共用模具、包装、运费体积和检测报告。把“请报粉色瓶子”和两种树脂混在一行未标注的询盘里，样品和证书就会对不上市场。</p>
<p>applebearbaby.net 是浙江佑智母婴用品有限公司在义乌的品牌总部。ISO 9001:2015 是工厂级。食品接触报告是 SKU 族文件——请写欧盟、美国或其他目的地，以便附上对应档案。</p>
<h2>给采购台的对照</h2>
<div style="overflow-x:auto">
<table>
  <thead><tr><th>材料</th><th>典型 OEM 用途</th><th>运费与包装</th><th>AppleBear 示例</th></tr></thead>
  <tbody>
    <tr><td>PP（聚丙烯）</td><td>批量批发、带手柄瓶、商超礼盒——我们的主线</td><td>海运轻、比玻璃耐摔</td><td><a href="${PP_812}">812 240ml 宽口</a>、<a href="${PP_8005C}">8005C 五件套</a>、<a href="${PP_101}">AB-101 280ml</a>（该型号 144 只/箱）</td></tr>
    <tr><td>高硼硅玻璃</td><td>新生儿/药房玻璃线，“玻璃 / 无 BPA”货架故事</td><td>更重；出口包装须考虑破损</td><td><a href="${GLASS_60}">AB-125B 60ml</a>、<a href="${GLASS_120}">120ml</a>、<a href="${GLASS_200}">200ml</a> 标口</td></tr>
    <tr><td>PPSU</td><td>不提供</td><td>—</td><td>AppleBear Baby 不生产 PPSU 奶瓶，也不在现有 PP 模具上报价 PPSU 树脂。</td></tr>
  </tbody>
</table>
</div>
<p>这些系列的奶嘴是食品级硅胶。改流速不是新瓶身模具。硅胶瓶身需要硅胶产线，与 PP 礼盒分开报价。</p>
<h2>何时指定 PP</h2>
<p>几乎所有 AppleBear OEM 项目都指定 PP：箱数、在产卡通或带手柄模具、以及不必承担玻璃重量的海运。<a href="${PP_812}">812</a> 是 240ml 宽口 PP，三种库存色。<a href="${PP_8005C}">8005C</a> 是标口五件套礼盒（160ml + 240ml、围兜、刷、棉签）——商超入门套，不是宽口 SKU。AB-101 是 280ml 标口 PP，装箱 144 只；其他型号以装箱单确认箱数，不是公开价卡。</p>
<p>礼盒目录的瓶身是 PP。询盘是“如图礼盒”，就报 PP。只有规格是新生儿/药房玻璃线时才改玻璃。</p>
<h2>我们不做 PPSU</h2>
<p>部分医院和精品招标会写 PPSU。那是另一种树脂、另一套模具，不是义乌这条线。我们不会把 PP 卡通瓶改标成 PPSU，也不会在现有 PP 模具上报 PPSU 升级。若 PPSU 是硬性要求，本厂不是该瓶身的来源。能接受 PP 或玻璃的买家请在询盘中写明。</p>
<h2>何时指定玻璃</h2>
<p>货架故事是玻璃、买家要不易吸附气味的新生儿规格、或药房包装已印“玻璃 / 无 BPA”时，指定高硼硅。<a href="${GLASS_60}">AB-125B</a> 是 60ml 标口新生儿 SKU，慢流量奶嘴与挂孔彩盒。120ml 与 200ml 同口径族。玻璃不是 60ml PP 的即插替换：包装、起订、运费各自成行。</p>
<h2>第一次材料报价要可用，请发</h2>
<ul>
<li>瓶身材料：PP 或高硼硅——若两种都要，一行一种树脂。不要写 PPSU；我们不做。</li>
<li>容量与口径（标口或宽口）。宽口 PP 如 812 与标口 8005C 不共用螺纹。</li>
<li>库存卡通/彩盒还是贴牌印刷。印刷通常是换版，不是新瓶身模具。</li>
<li>目的市场，以便食品接触报告匹配 SKU 族（ISO 9001 仅工厂级）。</li>
<li>试单还是持续数量。在产模具的库存 PP 常可从一箱起；定制印刷与玻璃包装可能提高门槛。</li>
</ul>
<p>起订量、样品与交期见 <a href="/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles">工厂清单</a>。运费模式见 <a href="/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl">义乌如何发货</a>。短答：<a href="/faq">OEM 常见问题</a>。用 <a href="/contact">联系表</a> 或 WhatsApp 发上述五块。</p>`,
    },
    es: {
      title: 'Biberones PP vs vidrio: qué material indicar en un RFQ OEM',
      excerpt: 'AppleBear Baby en Yiwu es OEM de PP primero, con línea de vidrio borosilicato. No fabricamos PPSU. Qué material de cuerpo poner en el RFQ y qué SKU de catálogo coinciden.',
      content: `<p class="geo-answer">AppleBear Baby en Yiwu fabrica cuerpos en PP alimentario (línea OEM principal de gift sets y volumen) y vidrio borosilicato (60, 120 y 200 ml cuello estándar). No usamos PPSU ni lo cotizamos como upgrade. Modelos PP como 812 y 8005C son el caballo de batalla. Nombre PP o vidrio en el mismo mensaje que cantidad y destino — un pliego PPSU no es un SKU que corramos.</p>
<h2>Ponga la resina en el RFQ, no solo la foto</h2>
<p>PP y vidrio no comparten utillaje, packing, cubo de flete ni informes de ensayo. Mezclar “coticen el biberón rosa” con dos resinas en una línea sin etiqueta es cómo fallan muestras y certificados.</p>
<p>ISO 9001:2015 es de fábrica. Los informes de contacto alimentario son documentos de familia SKU — nombre UE, EE. UU. u otro destino.</p>
<h2>Comparación para mesas OEM</h2>
<div style="overflow-x:auto">
<table>
  <thead><tr><th>Material</th><th>Uso OEM típico</th><th>Flete y packing</th><th>Ejemplos AppleBear</th></tr></thead>
  <tbody>
    <tr><td>PP (polipropileno)</td><td>Volumen, biberones con asa, gift sets de supermercado — nuestra línea principal</td><td>Ligero a mar; más resistente a caídas que el vidrio</td><td><a href="${PP_812}">812 240 ml cuello ancho</a>, <a href="${PP_8005C}">8005C set 5 piezas</a>, <a href="${PP_101}">AB-101 280 ml</a> (144 pzas/ctn en ese modelo)</td></tr>
    <tr><td>Vidrio borosilicato</td><td>Línea neonatal / farmacia, historia “vidrio / BPA-free”</td><td>Más pesado; packing de exportación debe prever rotura</td><td><a href="${GLASS_60}">AB-125B 60 ml</a>, <a href="${GLASS_120}">120 ml</a>, <a href="${GLASS_200}">200 ml</a> cuello estándar</td></tr>
    <tr><td>PPSU</td><td>No ofrecido</td><td>—</td><td>No fabricamos PPSU ni cotizamos esa resina en nuestros moldes.</td></tr>
  </tbody>
</table>
</div>
<h2>Cuándo especificar PP</h2>
<p>Especifique PP en casi todo programa OEM AppleBear. <a href="${PP_812}">812</a> es 240 ml cuello ancho en tres colores stock. <a href="${PP_8005C}">8005C</a> es un gift set de 5 piezas de boca estándar — kit de supermercado, no un SKU de cuello ancho.</p>
<h2>No corremos PPSU</h2>
<p>Algunos concursos hospitalarios escriben PPSU. Es otra resina y otra familia de herramientas. No relabelamos un biberón PP como PPSU. Si PPSU es requisito duro, esta fábrica no es la fuente de ese cuerpo.</p>
<h2>Cuándo especificar vidrio</h2>
<p>Especifique borosilicato cuando la historia de lineal es vidrio o el pack de farmacia ya imprime “vidrio / BPA-free”. <a href="${GLASS_60}">AB-125B</a> es el SKU neonatal 60 ml. El vidrio no es un drop-in de 60 ml PP.</p>
<ul>
<li>Material de cuerpo: PP o vidrio borosilicato — una resina por línea. No escriba PPSU.</li>
<li>Capacidad y cuello (estándar o ancho). El PP de cuello ancho 812 no comparte rosca con 8005C.</li>
<li>Caja cartoon stock vs impresión private-label.</li>
<li>Mercado de destino para informes de contacto alimentario.</li>
<li>Cantidad de prueba vs continua.</li>
</ul>
<p>MOQ y plazo: <a href="/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles">esta lista</a>. Flete: <a href="/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl">cómo enviamos desde Yiwu</a>. Respuestas cortas: <a href="/faq">FAQ OEM</a>.</p>`,
    },
    ar: {
      title: 'زجاجات PP مقابل الزجاج: أي مادة تكتب في طلب عرض OEM',
      excerpt: 'AppleBear Baby في ييوو مصنع PP أولاً مع خط زجاج البوروسيليكات. لا ننتج PPSU. أي مادة جسم تضعها في طلب العرض وأي طرازات الكتالوج تطابق.',
      content: `<p class="geo-answer">تصنّع AppleBear Baby في ييوو أجسام الزجاجات من PP الغذائي (خط OEM الرئيسي للمجموعات والكميات) وزجاج البوروسيليكات (60 و120 و200 مل عنق قياسي). لا نستخدم PPSU ولا نسعّره كترقية. طرازات PP مثل 812 و8005C هي عماد الكتالوج. اذكروا PP أو الزجاج مع الكمية والوجهة في الرسالة نفسها — مناقصة PPSU ليست SKU نشغّله.</p>
<h2>ضعوا الراتنج في طلب العرض لا الصورة وحدها</h2>
<p>PP والزجاج لا يشتركان في القوالب والتعبئة وحجم الشحن وتقارير الاختبار. ISO 9001:2015 على مستوى المصنع. تقارير ملامسة الغذاء ملفات عائلة SKU.</p>
<h2>مقارنة لمكاتب OEM</h2>
<div style="overflow-x:auto">
<table>
  <thead><tr><th>المادة</th><th>استخدام OEM النموذجي</th><th>أمثلة AppleBear</th></tr></thead>
  <tbody>
    <tr><td>PP</td><td>الجملة والمجموعات والمقابض — خطنا الرئيسي</td><td><a href="${PP_812}">812 240 مل عنق واسع</a>، <a href="${PP_8005C}">8005C طقم 5 قطع</a>، <a href="${PP_101}">AB-101 280 مل</a></td></tr>
    <tr><td>زجاج البوروسيليكات</td><td>خط حديثي الولادة / الصيدلية</td><td><a href="${GLASS_60}">AB-125B 60 مل</a>، <a href="${GLASS_120}">120 مل</a>، <a href="${GLASS_200}">200 مل</a></td></tr>
    <tr><td>PPSU</td><td>غير معروض</td><td>لا ننتج PPSU ولا نسعّر هذا الراتنج على قوالبنا.</td></tr>
  </tbody>
</table>
</div>
<h2>متى تحددون PP</h2>
<p>حدّدوا PP في معظم برامج OEM لدى AppleBear. <a href="${PP_812}">812</a> عنق واسع 240 مل بثلاثة ألوان مخزون. <a href="${PP_8005C}">8005C</a> طقم فم قياسي من 5 قطع — ليس SKU عنق واسع.</p>
<h2>لا نشغّل PPSU</h2>
<p>بعض مناقصات المستشفيات تكتب PPSU. راتنج مختلف وعائلة قوالب مختلفة. إن كان PPSU شرطاً صارماً فهذا المصنع ليس مصدر ذلك الجسم.</p>
<h2>متى تحددون الزجاج</h2>
<p>عندما تكون قصة الرف زجاجاً أو عبوة الصيدلية تطبع «زجاج / خالٍ من BPA». <a href="${GLASS_60}">AB-125B</a> هو SKU حديثي الولادة 60 مل. الزجاج ليس بديلاً مباشراً لـ 60 مل PP.</p>
<p>انظر أيضاً: <a href="/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles">الحد الأدنى والعينات</a>، <a href="/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl">الشحن من ييوو</a>، <a href="/faq">أسئلة OEM</a>.</p>`,
    },
    fr: {
      title: 'Biberons PP vs verre : quel matériau indiquer dans un RFQ OEM',
      excerpt: 'AppleBear Baby à Yiwu est OEM PP d’abord, avec une ligne verre borosilicate. Nous ne fabriquons pas de PPSU. Quel matériau de corps mettre dans l’RFQ et quels SKU catalogue correspondent.',
      content: `<p class="geo-answer">AppleBear Baby à Yiwu fabrique les corps en PP alimentaire (ligne OEM principale des coffrets et du volume) et en verre borosilicate (60, 120 et 200 ml col standard). Nous n’utilisons pas le PPSU et ne le cotons pas en upgrade. Les modèles PP 812 et 8005C sont le cheval de trait. Nommez PP ou verre dans le même message que quantité et destination — un appel d’offres PPSU n’est pas un SKU que nous tournons.</p>
<h2>Mettez la résine dans l’RFQ, pas seulement la photo</h2>
<p>PP et verre ne partagent ni outillage, ni packing, ni cube fret, ni rapports d’essais. ISO 9001:2015 est usine. Les rapports de contact alimentaire sont des documents de famille SKU — nommez UE, États-Unis ou autre destination.</p>
<h2>Comparaison pour bureaux OEM</h2>
<div style="overflow-x:auto">
<table>
  <thead><tr><th>Matériau</th><th>Usage OEM typique</th><th>Exemples AppleBear</th></tr></thead>
  <tbody>
    <tr><td>PP (polypropylène)</td><td>Volume, biberons à anse, coffrets supermarché — notre ligne principale</td><td><a href="${PP_812}">812 240 ml col large</a>, <a href="${PP_8005C}">8005C coffret 5 pièces</a>, <a href="${PP_101}">AB-101 280 ml</a> (144 pcs/ctn sur ce modèle)</td></tr>
    <tr><td>Verre borosilicate</td><td>Ligne nouveau-né / pharmacie, récit « verre / sans BPA »</td><td><a href="${GLASS_60}">AB-125B 60 ml</a>, <a href="${GLASS_120}">120 ml</a>, <a href="${GLASS_200}">200 ml</a> col standard</td></tr>
    <tr><td>PPSU</td><td>Non proposé</td><td>Nous ne fabriquons pas de PPSU et ne cotons pas cette résine sur nos moules.</td></tr>
  </tbody>
</table>
</div>
<h2>Quand spécifier le PP</h2>
<p>Spécifiez le PP pour presque tout programme OEM AppleBear. <a href="${PP_812}">812</a> est un 240 ml col large en trois couleurs stock. <a href="${PP_8005C}">8005C</a> est un coffret 5 pièces bouche standard — kit supermarché, pas un SKU col large.</p>
<h2>Nous ne tournons pas le PPSU</h2>
<p>Certains appels d’offres hôpitaux écrivent PPSU. Autre résine, autre famille d’outils. Nous ne relabelons pas un biberon PP en PPSU. Si le PPSU est un dur, cette usine n’est pas la source de ce corps.</p>
<h2>Quand spécifier le verre</h2>
<p>Spécifiez le borosilicate quand le récit linéaire est verre ou que le pack pharmacie imprime déjà « verre / sans BPA ». <a href="${GLASS_60}">AB-125B</a> est le SKU nouveau-né 60 ml. Le verre n’est pas un drop-in du 60 ml PP.</p>
<p>MOQ et délai : <a href="/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles">cette liste</a>. Fret : <a href="/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl">comment nous expédions depuis Yiwu</a>. Réponses courtes : <a href="/faq">FAQ OEM</a>.</p>`,
    },
  },
}

export const CATEGORY_NAME_I18N = {
  'Bottle Nipples': { zh: '奶嘴', es: 'Tetinas', ar: 'حلمات الزجاجة', fr: 'Tétines' },
  Nipple: { zh: '奶嘴', es: 'Tetina', ar: 'حلمة', fr: 'Tétine' },
  Nipples: { zh: '奶嘴', es: 'Tetinas', ar: 'حلمات', fr: 'Tétines' },
  'Bath & Care': { zh: '洗护', es: 'Baño y cuidado', ar: 'الاستحمام والعناية', fr: 'Bain et soin' },
  'Bath and Care': { zh: '洗护', es: 'Baño y cuidado', ar: 'الاستحمام والعناية', fr: 'Bain et soin' },
  'Sippy Cups': { zh: '学饮杯', es: 'Vasos antiderrame', ar: 'أكواب الشرب', fr: 'Tasses d’apprentissage' },
  'Sippy Cup': { zh: '学饮杯', es: 'Vaso antiderrame', ar: 'كوب شرب', fr: 'Tasse d’apprentissage' },
  'Baby Clothing': { zh: '婴童服装', es: 'Ropa de bebé', ar: 'ملابس الرضع', fr: 'Vêtements bébé' },
  'Bottle Brushes': { zh: '奶瓶刷', es: 'Cepillos para biberón', ar: 'فراشي الزجاجة', fr: 'Brosses à biberon' },
  'Bottle Brush': { zh: '奶瓶刷', es: 'Cepillo para biberón', ar: 'فرشاة الزجاجة', fr: 'Brosse à biberon' },
  'Pacifiers & Teethers': { zh: '安抚奶嘴与牙胶', es: 'Chupetes y mordedores', ar: 'المصاصات وعضاضات الأسنان', fr: 'Sucettes et anneaux' },
  Pacifier: { zh: '安抚奶嘴', es: 'Chupete', ar: 'مصاصة', fr: 'Sucette' },
  Pacifiers: { zh: '安抚奶嘴', es: 'Chupetes', ar: 'مصاصات', fr: 'Sucettes' },
  'Feeding Sets': { zh: '喂养套装', es: 'Sets de alimentación', ar: 'أطقم الإطعام', fr: 'Coffrets d’alimentation' },
  'Baby Feeding Bottle Set': { zh: '喂养礼盒', es: 'Set de biberones', ar: 'طقم زجاجات الرضاعة', fr: 'Coffret de biberons' },
  'Baby feeding Bottle Set': { zh: '喂养礼盒', es: 'Set de biberones', ar: 'طقم زجاجات الرضاعة', fr: 'Coffret de biberons' },
  Bottle: { zh: '奶瓶', es: 'Biberón', ar: 'زجاجة رضاعة', fr: 'Biberon' },
  Teether: { zh: '牙胶', es: 'Mordedor', ar: 'عضاضة', fr: 'Anneau de dentition' },
  'Standard Mouth': { zh: '标口', es: 'Boca estándar', ar: 'فوهة قياسية', fr: 'Col standard' },
  'Wide Mouth': { zh: '宽口', es: 'Boca ancha', ar: 'فوهة واسعة', fr: 'Col large' },
  Boxed: { zh: '彩盒', es: 'Caja', ar: 'علبة', fr: 'Boîte' },
  'OPP Packing': { zh: '袋装', es: 'Bolsa OPP', ar: 'تغليف OPP', fr: 'Sachet OPP' },
  'Opp Packing': { zh: '袋装', es: 'Bolsa OPP', ar: 'تغليف OPP', fr: 'Sachet OPP' },
  'Feeding Bottles': { zh: '奶瓶', es: 'Biberones', ar: 'زجاجات الرضاعة', fr: 'Biberons' },
  'Breast Pumps': { zh: '吸奶器', es: 'Extractores', ar: 'مضخات الحليب', fr: 'Tire-lait' },
  'Breast Pump': { zh: '吸奶器', es: 'Extractor', ar: 'مضخة الحليب', fr: 'Tire-lait' },
  'Baby Bottles': { zh: '奶瓶', es: 'Biberones', ar: 'زجاجات الرضاعة', fr: 'Biberons' },
  'Feeding Bottle': { zh: '奶瓶', es: 'Biberón', ar: 'زجاجة رضاعة', fr: 'Biberon' },
}
