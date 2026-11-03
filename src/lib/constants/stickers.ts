const BASE_PROMT = `
Create a collection high-quality, animated cartoon-style chat stickers based on the uploaded reference photo. Preserve the person's recognizable facial features, hairstyle, glasses, and overall identity across all stickers, transforming the person into a polished 2D animated character.
Art style: expressive anime-inspired cartoon illustration, smooth clean line art, bold outlines, soft cel shading, vibrant but natural colors, cute and exaggerated facial expressions, professional messaging app sticker aesthetic.
Sticker design: Each sticker features a head-and-shoulders portrait of the same character, with a unique facial expression and pose matching a different emotion. Every sticker must have a thick, clean white die-cut sticker border surrounding the character and any decorative elements. Use small expressive accents where appropriate, such as hearts, tears, question marks, stars, or anger symbols.
Emotions to include:
<<emotions>>
1. Tiny Rage — puffed cheeks, tiny fists raised, furious expression.
Consistency: All 10 stickers must feature the same person, hairstyle, glasses (except when intentionally changed for the Cool expression), clothing, illustration style, proportions, outline thickness, and overall visual quality. Make each emotion immediately recognizable, with distinct expressions rather than minor variations of the same face.
Background: Fully transparent PNG backgrounds with no background scenery, no white rectangular canvas, and no shadows outside the sticker borders. Each sticker must be isolated from the others.
Composition and output: Generate individual sticker images, each with a square 250 × 250 px canvas. Center the character, keep the entire sticker border within the canvas, and ensure a clear silhouette that remains readable at small sizes.
Output requirements: A single combined image, sticker sheet, grid, or collage. Use transparent PNG format, with no text, no labels, no watermarks, and no extra characters.

`
const EMOTION_LIST = ` 
Happy — cheerful smile and sparkling eyes.
Sad — teary eyes and a trembling pout.
Angry — furrowed eyebrows and puffed cheeks.
Surprised — wide eyes and an open mouth.
Laughing — eyes closed and a big joyful grin.
Thinking — hand on chin and eyes looking upward.
Tired — sleepy eyes and a drooping head.
Shy — blushing cheeks and a bashful smile.
Confused — uneven eyebrows and a puzzled expression.
Cool — confident smirk and stylish sunglasses.
Silly — tongue sticking out, one eye winking, goofy grin.
Ugly Crying — mouth wide open, streams of oversized tears.
Rolling Eyes — eyes looking dramatically upward, unimpressed expression.
Facepalm — one hand covering the face in embarrassment.
Nervous Laugh — awkward smile, sweat drops, trembling eyebrows.
Dead Inside — blank eyes, lifeless expression, emotionless face.
Mischievous — cheeky grin, raised eyebrow, plotting expression.
Cackling — head tilted back, mouth wide open, tears of laughter.
Panic Mode — bulging eyes, open mouth, sweating excessively.
Brain Freeze — frozen expression, hands holding head.
Dramatic Shock — jaw dropped, eyes popping out.
Greedy — sparkling dollar-sign eyes, rubbing hands together.
Hungry — drooling, puppy eyes, imagining delicious food.
Sleepwalking — half-closed eyes, mouth open, arms stretched forward.
Sassy — hand on hip, raised eyebrow, sarcastic smirk.
Goblin Mode — mischievous wide grin, crazy eyes.
Cringe — scrunched face, shoulders raised, awkward smile.
Overthinking — messy hair, spiraling eyes, surrounded by question marks.
Fake Smile — forced giant smile, dead eyes, nervous sweat.
I Give Up — completely exhausted face, hands raised in surrender.
Begging — puppy eyes, hands clasped together.
Flirting — exaggerated wink, puckered lips, floating hearts.
Evil Laugh — sinister grin, narrowed eyes, dramatic expression.
Shocked Speechless — mouth covered with both hands.
Sarcastic Clap — unimpressed smile, slowly clapping.
Too Hot — fanning herself, tongue out, sweat everywhere.
Too Cold — shivering, chattering teeth, wrapped in arms.
Nosebleed — exaggerated anime embarrassment.
Possessed — spiraling eyes, crazy grin, chaotic expression.
Tiny Rage — puffed cheeks, tiny fists raised, furious expression.
`