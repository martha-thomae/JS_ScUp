const MergeModule = require('./Merge.js');
const ArsAntiqua = require('./ArsAntiqua.js');
//const ArsNova_and_WhiteMensural = require('./ArsNova_and_WhiteMensural.js');

const { JSDOM } = require('jsdom');
const window = new JSDOM().window;
const DOMParser = window.DOMParser;
const XMLSerializer = window.XMLSerializer;

// Input file (as a string)
var inputMeiString = '<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.1"><meiHead><fileDesc><titleStmt><title>Sicut</title><composer>Anonymous</composer>' + 
'<respStmt><persName role="encoder">MThomae</persName></respStmt></titleStmt><pubStmt/><sourceDesc><source target="https://gallica.bnf.fr/iiif/ark:/12148/btv1b8454675g/manifest.json"/>' + 
'</sourceDesc></fileDesc></meiHead><music><facsimile><surface xml:id="m-bab3a04d-d351-44c4-8e30-ebc2c1c89f4f"><graphic xml:id="m-62b752be-ffe1-4350-8928-6200a7b3937f" target="https://gallica.bnf.fr/iiif/ark:/12148/btv1b8454675g/canvas/f30" ulx="0" uly="0">' + 
'<zone xml:id="m-3c675d90-9ae7-4dac-88f2-3e6d4bf2e1a8" ulx="2714" uly="857" lrx="3771" lry="1226"/>' + 
'<zone xml:id="m-e1d3b5df-8874-4ea1-9c3a-539b5e96b6cd" ulx="2510" uly="1270" lrx="3771" lry="1626"/>' + 
'<zone xml:id="m-27596f61-e2cf-474f-b45e-dda092322b71" ulx="2538" uly="1694" lrx="3779" lry="2072"/>' + 
'<zone xml:id="m-f60395c4-ef18-4677-ab52-b1ec294b5ddd" ulx="2546" uly="2152" lrx="3771" lry="2468"/>' + 
'<zone xml:id="m-ff74bbff-e4bc-46f7-a983-e0baeda8ed13" ulx="2542" uly="2530" lrx="3781" lry="2874"/>' + 
'<zone xml:id="m-fce159a3-cbd7-4b84-af99-e756af300d0d" ulx="2556" uly="2534" lrx="2556" lry="2534"/>' + 
'<zone xml:id="m-8d38795d-3aec-4c6c-ba77-6415f9a77f84" ulx="2949" uly="5042" lrx="3825" lry="5374"/>' + 
'<zone xml:id="m-0a833f76-7280-42e1-8aed-d4584ed99891" ulx="2815" uly="2974" lrx="3785" lry="3304"/>' + 
'<zone xml:id="m-96ca5b84-9b36-40cd-8d55-1d3d9f16619a" ulx="2510" uly="3398" lrx="3799" lry="3716"/>' + 
'<zone xml:id="m-2dd3406c-113f-4853-a84d-50b28b11ac08" ulx="2530" uly="3832" lrx="3801" lry="4142"/>' + 
'<zone xml:id="m-b58764ba-514e-4f55-899f-9b0bbd55e3c6" ulx="2564" uly="4212" lrx="3805" lry="4528"/>' + 
'<zone xml:id="m-b4f31732-290e-46b8-8463-d1fc18545164" ulx="2546" uly="4646" lrx="3801" lry="4938"/>' + 
'<zone xml:id="m-df7aa7f6-2088-4447-96db-4e4ff93d04cc" ulx="2578" uly="5034" lrx="2939" lry="5344"/>' + 
'<zone xml:id="m-c3bb8405-e17c-4a9f-bd64-933cddf9009a" ulx="2576" uly="5480" lrx="3839" lry="5798"/>' + 
'</graphic></surface></facsimile><body><mdiv><parts><part><scoreDef><staffGrp>' + 
'<staffDef n="1" lines="5" notationtype="mensural.black" notationsubtype="Ars antiqua" label="triplum" modusminor="3" tempus="3"/></staffGrp></scoreDef><section><staff n="1">' + 
'<layer><pb facs="#m-62b752be-ffe1-4350-8928-6200a7b3937f"/><sb facs="#m-3c675d90-9ae7-4dac-88f2-3e6d4bf2e1a8"/>' + 
'<clef xml:id="m-adbec225-00bc-45bf-8ed7-02abd21a28a4" shape="C" line="2"/>' + 
'<note xml:id="m-fd0b3dfb-0f30-445c-930d-f74f3236b783" dur="longa" oct="4" pname="g"/>' + 
'<note xml:id="m-194bdcf8-8589-4eb8-b001-fffaaca0c2e4" dur="semibrevis" oct="4" pname="a"/>' + 
'<note xml:id="m-a992400e-5715-428e-91e3-bc91a26e47a5" dur="semibrevis" oct="4" pname="g"/>' + 
'<note xml:id="m-733be713-da4a-4ad3-95f2-15e7b5d8e0a1" dur="semibrevis" oct="4" pname="a"/>' + 
'<note xml:id="m-de79f786-5e35-46ca-ba92-2d9a14889fa1" dur="semibrevis" oct="4" pname="b"/>' + 
'<note xml:id="m-7eb2b914-ac3d-49cf-88ae-3c6d73d233db" dur="longa" oct="4" pname="g"/>' + 
'<note xml:id="m-0aaaec22-b380-4b90-89e5-a34d1000240d" dur="semibrevis" oct="4" pname="g"/>' + 
'<note xml:id="m-405dc9c8-c2e8-4156-b7c6-85297ae17a78" dur="semibrevis" oct="4" pname="f"/>' + 
'<note xml:id="m-fd7ecd09-015f-4ac2-a463-e4fb115b82e6" dur="semibrevis" oct="4" pname="g"/>' + 
'<note xml:id="m-9f34aa1c-6110-4f5b-b489-801424d3f06a" dur="longa" oct="4" pname="a"/>' + 
'<ligature xml:id="m-606a0323-431e-4814-9112-0f7c522b1bc5"><note xml:id="m-bf31f0a6-3361-4040-8e18-f810c40150f8" dur="semibrevis" oct="4" pname="b"/>' + 
'<note xml:id="m-ae436ef2-d30d-4080-885e-fbc17ea962b2" dur="semibrevis" oct="4" pname="a"/></ligature>' + 
'<note xml:id="m-849227ee-fa6d-466c-805f-db96593177af" dur="brevis" oct="4" pname="g"/>' + 
'<note xml:id="m-a89b6a56-f9a1-4144-9765-002f9f85f312" dur="semibrevis" oct="4" pname="f"/>' + 
'<note xml:id="m-79e4ef75-4077-4786-a18c-cb11a4acc1f5" dur="semibrevis" oct="4" pname="e"/>' + 
'<note xml:id="m-e70d9145-ad3f-4731-a63f-7aa1ee5b08ab" dur="semibrevis" oct="4" pname="d"/>' + 
'<note xml:id="m-91d1d90c-2090-4e01-8839-25f482ab1983" dur="brevis" oct="4" pname="e"/>' + 
'<note xml:id="m-9dd8fd73-9a31-4943-92ad-9d3993fb1ff2" dur="semibrevis" oct="4" pname="d"/><sb facs="#m-e1d3b5df-8874-4ea1-9c3a-539b5e96b6cd"/>' + 
'<clef xml:id="m-ee4240e2-8c65-4251-9ee2-0c5df031d734" shape="C" line="2"/><note xml:id="m-d36511cf-48d2-4f3c-9a04-e459e1813da7" dots="1" dur="semibrevis" oct="4" pname="d"/>' + 
'<dot xml:id="m-fd5492f7-5675-4104-b496-6fd581d1e9d8"/><note xml:id="m-d34cb4ec-f190-41aa-9354-e1ab8a1d69af" dur="semibrevis" oct="4" pname="g"/>' + 
'<note xml:id="m-a45bf84a-b17b-44e4-8921-7c6628f32d1f" dur="semibrevis" oct="4" pname="g"/><note xml:id="m-1e1af12d-dd07-49d0-a5a7-4cde5036ed36" dur="brevis" oct="4" pname="e"/>' + 
'<note xml:id="m-d27c55fb-bd1d-4f97-96a1-a6dac22848cd" dur="longa" oct="4" pname="f"/><rest xml:id="m-e0fc86d4-2e9d-427c-8c45-176fccb0b06c" dur="brevis"/>' + 
'<note xml:id="m-82f4378b-4295-4425-ad06-068d8a07d142" dur="longa" oct="4" pname="g"/><note xml:id="m-a7793132-d9d4-4658-a02e-2c12d38b0baa" dur="semibrevis" oct="4" pname="a"/>' + 
'<note xml:id="m-8954a532-1df7-4a45-9466-77a09651789a" dur="semibrevis" oct="4" pname="g"/><note xml:id="m-825b9e57-445d-4edd-99e8-634b1702c112" dur="semibrevis" oct="4" pname="a"/>' + 
'<note xml:id="m-3ccefd1d-caf1-4740-9413-57b2e77e4892" dur="semibrevis" oct="4" pname="b"/><note xml:id="m-e3a7dfef-eafd-4b14-805e-0fd31a10e6a3" dur="longa" oct="4" pname="g"/>' + 
'<note xml:id="m-fb69b735-988a-4f0e-ae2a-63c1b43d9a3e" dur="semibrevis" oct="4" pname="g"/><note xml:id="m-9a7a426a-5b70-4580-bade-f654a7388af3" dur="semibrevis" oct="4" pname="f"/>' + 
'<note xml:id="m-9ce21825-a0d5-4fd1-b5a9-96461fe79a4f" dur="semibrevis" oct="4" pname="g"/><note xml:id="m-04253899-9e78-4ef0-b69f-86e8b765f23c" dur="longa" oct="4" pname="a"/>' + 
'<ligature xml:id="m-ef573333-8883-418d-a274-de8c30bbf12d"><note xml:id="m-895ff943-ba19-41c0-a13f-0381e101da61" dur="semibrevis" oct="4" pname="b"/>' + 
'<note xml:id="m-166ab53c-e5a0-486b-b799-e9de19cf86c9" dur="semibrevis" oct="4" pname="a"/></ligature>' + 
'<note xml:id="m-388867fb-aad5-4030-b9f7-6941220c9fcf" dur="longa" oct="4" pname="g"/><rest xml:id="m-9cf3741e-e2da-47a3-8160-c3bf7323990c" dur="brevis"/>' + 
'<sb facs="#m-27596f61-e2cf-474f-b45e-dda092322b71"/><clef xml:id="m-07b46428-eabb-4757-8f51-6991c2ee3123" shape="C" line="2"/>' + 
'<note xml:id="m-d3ba17f2-2673-4812-a915-0d902f17fe78" dur="longa" oct="4" pname="d"/><note xml:id="m-d9468e16-2cfe-4b41-8a7b-00981ab7581f" dur="brevis" oct="4" pname="e"/>' + 
'<note xml:id="m-72088cad-a032-4025-88c4-815fc26530b9" dur="longa" oct="4" pname="f"/><note xml:id="m-0ca2bf64-3410-47a0-ab97-8c8c3700de2f" dur="brevis" oct="4" pname="a"/>' + 
'<ligature xml:id="m-81d7d4f1-0010-40b2-adae-31726159f8af"><note xml:id="m-5bea2e96-9236-4c89-b7da-0fcadf333d67" dur="semibrevis" oct="4" pname="g"/>' + 
'<note xml:id="m-e17a62e5-a6b8-4620-8948-510cef57a48a" dur="semibrevis" oct="4" pname="f"/><note xml:id="m-044da066-f03a-4ad5-bbf9-db305338743d" dur="brevis" oct="4" pname="e"/>' + 
'</ligature><note xml:id="m-b0d156da-f795-4320-ad4e-74f3cd8cd09a" dur="brevis" oct="4" pname="d"/><note xml:id="m-fd468604-e9ee-4972-9dc4-e68cc6b3079e" dur="longa" oct="4" pname="c"/>' + 
'<rest xml:id="m-b48a5cfa-476d-4904-a8ac-b51d567960e5" dur="brevis"/><note xml:id="m-c475440a-39fb-4705-b27e-a179b145575a" dur="brevis" oct="4" pname="a"/>' + 
'<note xml:id="m-793c3f21-5c98-4df5-9b13-8ad5c30edf58" dur="brevis" oct="4" pname="f"/><sb facs="#m-f60395c4-ef18-4677-ab52-b1ec294b5ddd"/>' + 
'<clef xml:id="m-b91c76c7-8f70-4b25-b9fa-ea403e5e0dc6" shape="C" line="2"/><note xml:id="m-7a85a052-57aa-4c1f-9237-647bd3424acc" dur="longa" oct="4" pname="g"/>' + 
'<note xml:id="m-d2147476-f00e-4c53-ae95-706669288b12" dur="semibrevis" oct="4" pname="a"/><note xml:id="m-c9d8a68a-5f9f-42e9-ad41-23260bb966f8" dur="semibrevis" oct="4" pname="g"/>' + 
'<note xml:id="m-f82ab31e-c8b3-4424-8cba-61543a2606f4" dur="semibrevis" oct="4" pname="f"/><note xml:id="m-f564f082-4a42-4b97-aa3c-2f87b7350f5f" dur="brevis" oct="4" pname="g"/>' + 
'<note xml:id="m-9ac81f4c-a43f-4a63-9aaa-24e5315fbdeb" dur="semibrevis" oct="4" pname="f"/><note xml:id="m-692f684c-b23a-48a0-9854-413f1c8c9b77" dur="semibrevis" oct="4" pname="e"/>' + 
'<note xml:id="m-9711a9e7-ad7d-4803-97f6-45559c27c15c" dur="semibrevis" oct="4" pname="d"/><note xml:id="m-40cbb453-980d-408c-b489-67f6ac0a6ad8" dur="brevis" oct="4" pname="e"/>' + 
'<note xml:id="m-441e7ed3-bdb3-4cfd-b556-0f5472b2ce7f" dur="longa" oct="4" pname="f"/><rest xml:id="m-56e7e222-3bd7-4739-b6ef-38bde42abf63" dur="brevis"/>' + 
'<note xml:id="m-0f91ffd8-fc3b-4b6e-9641-38b7269ee73a" dur="longa" oct="4" pname="g"/><note xml:id="m-c49c513d-9cfc-4654-b3eb-3ab8d2ed453b" dur="semibrevis" oct="4" pname="a"/>' + 
'<note xml:id="m-5e7ec63e-4355-4eb0-959c-e901dd894d1d" dur="semibrevis" oct="4" pname="g"/><note xml:id="m-e842b553-2d3a-4384-8414-71bdf0986736" dur="semibrevis" oct="4" pname="a"/>' + 
'<note xml:id="m-f1dd8356-873b-4b1a-ae64-283cea5752e9" dur="semibrevis" oct="4" pname="b"/><note xml:id="m-e51c47d7-8dc9-46e3-a450-31802d76560a" dur="longa" oct="4" pname="g"/>' + 
'<note xml:id="m-f52baa1a-038f-4e48-9f0b-b106b168ed20" dur="semibrevis" oct="4" pname="g"/><note xml:id="m-55a38968-4c42-4213-8329-4de72f02c1e5" dur="semibrevis" oct="4" pname="f"/>' + 
'<note xml:id="m-60cb0a68-64eb-424d-80d6-04ff6bba1619" dur="semibrevis" oct="4" pname="g"/><sb facs="#m-ff74bbff-e4bc-46f7-a983-e0baeda8ed13"/>' + 
'<clef xml:id="m-9f0018d3-4626-4b42-8d7d-8ebabf67538b" shape="C" line="2"/><note xml:id="m-c799878f-d465-4692-9631-ce27d2802a88" dur="longa" oct="4" pname="a"/>' + 
'<ligature xml:id="m-f15b2b57-38a2-439e-a120-3fd99a969c03"><note xml:id="m-27916455-9609-4e94-95ad-82776fb0a70a" dur="semibrevis" oct="4" pname="b"/>' + 
'<note xml:id="m-05c2fd36-2802-4859-b09d-a469b8f631e4" dur="semibrevis" oct="4" pname="a"/></ligature><note xml:id="m-5e42075d-0a3f-46be-81f3-34b7ba546315" dur="brevis" oct="4" pname="g"/>' + 
'<note xml:id="m-74a1c280-6316-4083-96bd-93c63c8a72e4" dur="semibrevis" oct="4" pname="f"/><note xml:id="m-e8f4a41c-b2c6-437b-985e-f7c534038acc" dur="semibrevis" oct="4" pname="e"/>' + 
'<note xml:id="m-b3bc65a9-512e-4c8d-b40d-9e624b7fad8d" dur="semibrevis" oct="4" pname="d"/><note xml:id="m-101b5c27-226a-413a-baee-97f9f6666e34" dur="brevis" oct="4" pname="e"/>' + 
'<note xml:id="m-696e89f5-4572-42dc-b523-0fb2beb6ba12" dur="semibrevis" oct="4" pname="d"/><note xml:id="m-97a9ee01-9384-41ee-934a-bff8e10e2b9f" dots="1" dur="semibrevis" oct="4" pname="d"/>' + 
'<dot xml:id="m-8d39c4c8-86aa-479e-b873-ad70604e8fd8"/><note xml:id="m-65f9c934-d03a-416a-8320-98105d9a96c0" dur="semibrevis" oct="4" pname="g"/>' + 
'<note xml:id="m-f129dd10-f77b-478c-b581-c35606981e25" dur="semibrevis" oct="4" pname="g"/><note xml:id="m-101d98f9-761f-4cb2-b884-31e8121b2c02" dur="brevis" oct="4" pname="e"/>' + 
'<note xml:id="m-508d272a-9132-45d4-97e1-e75970b632b9" dur="longa" oct="4" pname="f"/></layer>' + 
'</staff></section></part><part><scoreDef><staffGrp><staffDef n="2" lines="5" notationtype="mensural.black" notationsubtype="Ars antiqua" label="motetus" modusminor="3" tempus="3"/>' + 
'</staffGrp></scoreDef><section><staff n="2"><layer><pb facs="#m-62b752be-ffe1-4350-8928-6200a7b3937f"/><sb facs="#m-0a833f76-7280-42e1-8aed-d4584ed99891"/>' + 
'<clef xml:id="m-fbcca465-8bbb-4707-b17c-b26e526ba8ef" shape="C" line="3"/><note xml:id="m-a96e0e06-532a-486f-a47b-5decd3a6fa53" dur="longa" oct="4" pname="g"/>' + 
'<note xml:id="m-c3cf0979-7e2f-46f8-80b3-24012b051675" dur="semibrevis" oct="4" pname="f"/><note xml:id="m-b6f00694-6b22-4441-880f-313fdef34531" dur="semibrevis" oct="4" pname="e"/>' + 
'<note xml:id="m-63f57719-91b2-4085-a783-417ee5b623bd" dur="semibrevis" oct="4" pname="d"/><note xml:id="m-ec3b1ca5-5881-4469-aa31-67cce9d26a3b" dur="longa" oct="4" pname="c"/>' + 
'<note xml:id="m-1727fab8-4797-44a0-b865-c17024e55cf9" dur="brevis" oct="4" pname="d"/><note xml:id="m-5f03f96e-ae20-4dc6-b4be-d6d7271c226f" dur="longa" oct="4" pname="e"/>' + 
'<note xml:id="m-787e1294-9bcf-410b-b8b4-5c7a8f373a37" dur="semibrevis" oct="4" pname="f"/><note xml:id="m-b28d9fe9-1262-4349-8439-f1ba9836c67b" dur="semibrevis" oct="4" pname="e"/>' + 
'<note xml:id="m-7407f26b-13d1-4dd9-a3fc-427bf2da911e" dur="semibrevis" oct="4" pname="f"/><note xml:id="m-1a361f06-8f0b-4b4e-872a-2319b36289d8" dur="brevis" oct="4" pname="d"/>' + 
'<sb facs="#m-96ca5b84-9b36-40cd-8d55-1d3d9f16619a"/><clef xml:id="m-b93b2cc6-c03b-401a-b7f0-dd58ceff6602" shape="C" line="3"/>' + 
'<note xml:id="m-af7794b3-0b7a-4944-8c79-e1bd124b8053" dur="brevis" oct="4" pname="d"/><note xml:id="m-9dc73d83-2d96-4927-9083-ba45371ccc09" dur="semibrevis" oct="4" pname="c"/>' + 
'<note xml:id="m-baeed99f-bce9-40e9-b1ca-d96cf8b37acc" dur="semibrevis" oct="3" pname="b"/><note xml:id="m-43ccd9af-189a-43d2-8774-2c94b3621e45" dots="1" dur="semibrevis" oct="3" pname="a"/>' + 
'<dot xml:id="m-dc38e584-dec1-44c2-8348-691421eda462"/><note xml:id="m-a2095755-d8e4-4021-a468-cdff58bd654b" dur="semibrevis" oct="3" pname="b"/>' + 
'<note xml:id="m-2bd1ae2d-9cc3-4812-b5bd-e5f39334f287" dots="1" dur="semibrevis" oct="3" pname="b"/><dot xml:id="m-a8b533d6-7592-4c2c-8f48-3774a13e9d4a"/>' + 
'<note xml:id="m-e9a5a94a-9460-465d-bc94-e3355922600f" dur="semibrevis" oct="4" pname="d"/><note xml:id="m-7d394219-5ea0-464a-85a6-afe12ecea91a" dur="semibrevis" oct="4" pname="d"/>' + 
'<ligature xml:id="m-5ec7af6a-1c5e-4fea-a110-83ad64cc3eb2"><note xml:id="m-8e439c5e-4fe7-4def-ab6d-7a46f521b9e3" dur="semibrevis" oct="4" pname="c"/>' + 
'<note xml:id="m-bf28605d-d125-47ff-8a2c-aec174bf0e31" dur="semibrevis" oct="3" pname="b"/></ligature>' + 
'<note xml:id="m-61004743-a957-4314-a0b0-db3b2ec2571e" dur="longa" oct="4" pname="c"/><rest xml:id="m-98178203-93ea-4429-bd92-e3b2ac936005" dur="brevis"/>' + 
'<note xml:id="m-5eb0b796-6cf6-413a-837a-44d6f7689af3" dur="longa" oct="4" pname="g"/><note xml:id="m-59edf0e3-e3b4-4f0b-905e-4811b98a8643" dur="semibrevis" oct="4" pname="f"/>' + 
'<note xml:id="m-14391815-36a4-4194-a7f4-c1ef43ff7854" dur="semibrevis" oct="4" pname="e"/><note xml:id="m-2fbbd2f9-9a20-403e-8126-13a46096f2ad" dur="semibrevis" oct="4" pname="d"/>' + 
'<sb facs="#m-2dd3406c-113f-4853-a84d-50b28b11ac08"/><clef xml:id="m-8ceb9571-6702-43ad-8812-51563592cd12" shape="C" line="3"/>' + 
'<note xml:id="m-9d1557c5-d3a6-45d1-b21e-2be07e22eb40" dur="longa" oct="4" pname="c"/><note xml:id="m-22b00efa-9561-4d0f-b35b-2a7494a3ae1f" dur="brevis" oct="4" pname="d"/>' + 
'<note xml:id="m-ff23294f-45ed-4c08-818f-bb1567b70403" dur="longa" oct="4" pname="e"/><note xml:id="m-1ae48feb-7289-4d77-b4b1-d3040551e246" dur="semibrevis" oct="4" pname="f"/>' + 
'<note xml:id="m-c157fe1c-bd0f-4925-91c9-02c6ce61add6" dur="semibrevis" oct="4" pname="e"/><note xml:id="m-cf68eda4-4c0b-4dbd-850b-62bf480cd736" dur="semibrevis" oct="4" pname="f"/>' + 
'<note xml:id="m-6130059e-19a6-47c9-8f15-98c030ccb930" dur="longa" oct="4" pname="d"/><rest xml:id="m-543f87e6-1f8b-4d43-9c49-ed11387e0909" dur="brevis"/>' + 
'<note xml:id="m-d74329dd-4150-45da-80a4-e917209b386a" dur="longa" oct="4" pname="e"/><note xml:id="m-1ca687f0-060e-48eb-8a6e-b5fb12ea1c20" dur="semibrevis" oct="4" pname="c"/>' + 
'<note xml:id="m-6c8ecaba-f807-4041-b7bc-6490cc124a26" dur="semibrevis" oct="3" pname="b"/><note xml:id="m-fd833477-0326-48e1-9705-42ca9e5d9b8a" dur="semibrevis" oct="3" pname="a"/>' + 
'<note xml:id="m-20a61946-4281-4cf1-9929-644e20228a34" dur="semibrevis" oct="3" pname="g"/><ligature xml:id="m-f4bd8e0a-00cc-4362-8e93-540d695c2ee2">' + 
'<note xml:id="m-da6d403e-b3f8-4c9b-abce-e22bdf778f74" dur="semibrevis" oct="3" pname="a"/><note xml:id="m-657bb646-6bd4-470f-9361-7fedf2b2cdf7" dur="semibrevis" oct="3" pname="g"/>' + 
'<note xml:id="m-efbc8f0f-c346-40ea-a0de-17ee2a546c3b" dur="brevis" oct="3" pname="a"/></ligature><note xml:id="m-20fc797e-57ad-4292-879e-8fd99dc6f9c8" dur="brevis" oct="3" pname="b"/>' + 
'<sb facs="#m-b58764ba-514e-4f55-899f-9b0bbd55e3c6"/><clef xml:id="m-9ba88b31-ceab-45ec-81d0-9fb758f939e2" shape="C" line="3"/>' + 
'<ligature xml:id="m-09dbdb94-9f42-4116-a53b-75fd6e2b7480"><note xml:id="m-f6d3258b-14d4-45de-88ad-57bd5f90990a" dur="semibrevis" oct="4" pname="c"/>' + 
'<note xml:id="m-a502d4ab-7525-4431-8131-ca3b5cad1e84" dur="semibrevis" oct="4" pname="d"/><note xml:id="m-3dce05db-b83c-4669-a62b-38a4b3dd5236" dur="brevis" oct="4" pname="e"/>' + 
'</ligature><note xml:id="m-38ac58ff-3b40-47bb-a1fd-fe47c0d81eb2" dur="brevis" oct="4" pname="f"/><note xml:id="m-3e914a5e-a42d-4bbc-a92b-a14f2c6e5584" dur="longa" oct="4" pname="g"/>' + 
'<rest xml:id="m-d06caf40-8087-4892-a040-7e660aededf6" dur="brevis"/><note xml:id="m-4708e747-4139-4712-9704-1c5dcb8aac11" dur="longa" oct="4" pname="e"/>' + 
'<note xml:id="m-221f0d95-ee7f-4cb3-8538-36e1f5ecd9fa" dur="semibrevis" oct="4" pname="f"/><note xml:id="m-d11ebc03-8bb5-4ca5-8f9f-9492b0273ae0" dur="semibrevis" oct="4" pname="e"/>' + 
'<note xml:id="m-d212dd3d-02c5-4c93-bdb4-50a08f3011e8" dur="semibrevis" oct="4" pname="f"/><note xml:id="m-4b99d60b-3ed7-4c0e-8cdb-134ef30c6e28" dur="longa" oct="4" pname="d"/>' + 
'<note xml:id="m-a3a8d81c-3018-43cd-b908-7a78575ad6d0" dur="brevis" oct="4" pname="c"/><note xml:id="m-7f5e278d-48b8-41ba-8c11-a26569868e4e" dur="brevis" oct="4" pname="d"/>' + 
'<note xml:id="m-84549323-264f-4543-9a47-d69aee8c3f76" dur="brevis" oct="4" pname="d"/><ligature xml:id="m-4fd62186-4646-4229-8151-ce94bd58ebf8">' + 
'<note xml:id="m-40e6b2ec-5f5f-4307-afce-3c57767e220a" dur="semibrevis" oct="4" pname="c"/><note xml:id="m-de60ca1c-40f1-4fb0-90ae-2d6469d89c2c" dur="semibrevis" oct="3" pname="b"/>' + 
'</ligature><note xml:id="m-ff6ba280-3cb4-4a45-b206-8ccd2c8404ee" dur="longa" oct="4" pname="c"/><rest xml:id="m-8a4848fd-ae19-4c35-b92b-fb6ec88b5675" dur="brevis"/>' + 
'<note xml:id="m-fe0aecd4-26af-42cb-b3b8-82dea0c61110" dur="longa" oct="4" pname="g"/><sb facs="#m-b4f31732-290e-46b8-8463-d1fc18545164"/>' + 
'<clef xml:id="m-dfd72076-1196-4e65-b633-32dcf8975010" shape="C" line="3"/><note xml:id="m-2ddf730a-56e1-4a94-ae04-ab4e283a1369" dur="semibrevis" oct="4" pname="f"/>' + 
'<note xml:id="m-73e033cb-ca7d-4a9a-8691-2c84c65437ef" dur="semibrevis" oct="4" pname="e"/><note xml:id="m-0f0236f7-2575-4625-9f5a-ff3b3f8d74af" dur="semibrevis" oct="4" pname="d"/>' + 
'<note xml:id="m-22ddeb24-b33e-43c5-974b-cd45ea41a062" dur="longa" oct="4" pname="c"/><note xml:id="m-ba5857fc-9cd8-4a9c-ad43-04d31be3ecc4" dur="brevis" oct="4" pname="d"/>' + 
'<note xml:id="m-eb92a07a-8e39-4dee-b56c-ab5e537e4eaa" dur="longa" oct="4" pname="e"/><note xml:id="m-2e2de00e-f0f3-4338-a12f-773edcac512d" dur="semibrevis" oct="4" pname="f"/>' + 
'<note xml:id="m-ce94678c-3dd2-469e-8fb5-74545aa85b29" dur="semibrevis" oct="4" pname="e"/><note xml:id="m-6df3a065-f0b4-4833-a58c-940c597288c4" dur="semibrevis" oct="4" pname="f"/>' + 
'<note xml:id="m-0dd68f32-f9cb-46a3-8cf5-4120b6d43509" dur="brevis" oct="4" pname="d"/><note xml:id="m-d5af2671-99b8-4c31-8d9e-4f33ce5caad0" dur="brevis" oct="4" pname="d"/>' + 
'<note xml:id="m-1c3513b4-3b7a-4199-b59b-49285adc43cf" dur="semibrevis" oct="4" pname="c"/><note xml:id="m-3aa068bd-fd10-4cb6-8824-a591d9826d98" dur="semibrevis" oct="3" pname="b"/>' + 
'<note xml:id="m-0dade4b2-cb68-4216-b5f7-149e752b0a68" dur="semibrevis" oct="3" pname="a"/><note xml:id="m-60a2ba57-b2f4-4b98-89bb-2f2a0af2cca4" dur="semibrevis" oct="3" pname="b"/>' + 
'<note xml:id="m-6373d9c9-d4b3-4070-807a-fc6b6b63523c" dots="1" dur="semibrevis" oct="3" pname="b"/><dot xml:id="m-9ebc10f1-e2ff-4c46-9a72-726258ecf20c"/>' + 
'<sb facs="#m-df7aa7f6-2088-4447-96db-4e4ff93d04cc"/><clef xml:id="m-3ce4add4-060d-40d0-89a0-9f44e5ebcd6c" shape="C" line="3"/>' + 
'<note xml:id="m-4f2d3fa5-7400-43e1-9b0b-f8afa2ea11b9" dur="semibrevis" oct="4" pname="d"/><note xml:id="m-12f9f1a8-bcaf-4ba2-b768-29a1bba20ecd" dur="semibrevis" oct="4" pname="d"/>' + 
'<ligature xml:id="m-3cc05f59-f460-4c60-930c-6289e8ced562"><note xml:id="m-afb6daf1-fde4-42fa-a8ca-5cda3df29361" dur="semibrevis" oct="4" pname="c"/>' + 
'<note xml:id="m-33830b1f-964a-46ac-b8ae-367e37f43da5" dur="semibrevis" oct="3" pname="b"/></ligature><note xml:id="m-22579bdd-0c7b-422f-8345-cac2bf7244e4" dur="longa" oct="4" pname="c"/>' + 
'<rest xml:id="m-b3fd350f-0f74-44f0-be08-6e1f8b6298c8" dur="brevis"/></layer></staff></section></part><part><scoreDef><staffGrp>' + 
'<staffDef n="3" lines="5" notationtype="mensural.black" notationsubtype="Ars antiqua" label="tenor" modusminor="3"/></staffGrp></scoreDef><section><staff n="3"><layer>' + 
'<pb facs="#m-62b752be-ffe1-4350-8928-6200a7b3937f"/><sb facs="#m-8d38795d-3aec-4c6c-ba77-6415f9a77f84"/>' + 
'<clef xml:id="m-abd45e78-95e6-4284-a59d-c49447fba03c" shape="C" line="3"/><rest xml:id="m-8d37b0c4-10db-4be2-b5b6-cda00f9f1fa8" dur="brevis"/>' + 
'<note xml:id="m-fd2ba66d-ac82-41a6-ab8d-ac244e2acd5d" dur="longa" oct="4" pname="c"/><note xml:id="m-5e74db5d-ca75-4e37-a3c4-bb1a54a71cec" dur="brevis" oct="3" pname="b"/>' + 
'<sb facs="#m-c3bb8405-e17c-4a9f-bd64-933cddf9009a"/><clef xml:id="m-06ae4487-621e-4cb1-9cf2-8636f1098e1e" shape="C" line="4"/>' + 
'<note xml:id="m-5fbb8cdf-3444-4ecc-bf9f-cfdb4cfc32e9" dur="longa" oct="4" pname="c"/><note xml:id="m-44a812ed-deb0-43a2-a0af-b7b64c5de632" dur="brevis" oct="3" pname="b"/>' + 
'<note xml:id="m-496b3de5-cd2e-4bb8-84ec-04d4e5d4d756" dur="longa" oct="3" pname="a"/><note xml:id="m-25241cda-cdc9-4c1f-8963-0c85ccece6b8" dur="brevis" oct="3" pname="f"/>' + 
'<note xml:id="m-d71b45aa-eecb-4550-8ec7-b32a6b0f0463" dur="longa" oct="3" pname="g"/><note xml:id="m-53b7b52b-0420-44df-ab5d-7bd92714acbb" dur="brevis" oct="3" pname="a"/>' + 
'<note xml:id="m-1a65f1b3-a438-45fa-b67b-f52ecfda6017" dur="longa" oct="3" pname="g"/><note xml:id="m-406e4e86-abad-45ec-b325-0c066a01ad40" dur="brevis" oct="3" pname="g"/>' + 
'<note xml:id="m-5f9272ca-f0b6-4f62-b21f-407917af4eeb" dur="longa" oct="3" pname="f"/><rest xml:id="m-b3303e9d-e09a-4604-a7bb-fd4474b50ef2" dur="brevis"/></layer></staff></section>' + 
'</part></parts></mdiv></body></music></mei>';

// Parsing the input file
const parser = new DOMParser();
const meiDoc = parser.parseFromString(inputMeiString, 'text/xml');

// 1. Change from parts-based into a score-based representation
const quasiscoreDoc = MergeModule.merge(meiDoc);

// 2. Lining-up of the voices
// Retrieve the type of notation:
var stavesDef = meiDoc.getElementsByTagName('staffDef');
var notation = stavesDef[0].getAttribute('notationtype');
var style = stavesDef[0].getAttribute('notationsubtype');
// Based on the notation style, apply rules to interpret the notes' duration
var scoreDoc;
switch (notation){
    case "mensural.white":
        scoreDoc = ArsNova_and_WhiteMensural.lining_up(quasiscoreDoc);
        break;
    case "mensural.black":
        switch (style) {
            case "Ars antiqua":
                scoreDoc = ArsAntiqua.lining_up(quasiscoreDoc);
                break;
            case "Ars nova":
                scoreDoc = ArsNova_and_WhiteMensural.lining_up(quasiscoreDoc);
                break;
        }break;
}

const serializer = new XMLSerializer();
const content = serializer.serializeToString(scoreDoc);

console.log(content);
