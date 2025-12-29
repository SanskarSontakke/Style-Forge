# Style Forge

Style Forge is a Virtual Stylist application powered by Google's Gemini AI. It allows users to upload a clothing item and automatically generate complete outfit recommendations for various occasions, such as Casual, Business, and Night Out. Users can also refine and edit the suggested outfits using AI text prompts.

## Features

- **Upload Clothing:** Start by uploading an image of a clothing item (e.g., a shirt, pants, or shoes).
- **AI-Powered Styling:** Automatically generate complete outfits based on the uploaded item.
- **Occasion-Based Recommendations:** Get outfit suggestions tailored for different scenarios:
  - Casual
  - Business
  - Night Out
- **Interactive Editing:** Use natural language text prompts to modify and refine the generated outfits (e.g., "make the shoes more formal" or "add a red scarf").
- **Powered by Gemini:** Leverages the advanced capabilities of the Google Gemini API for image understanding and fashion advice.

## Tech Stack

- **Frontend:** React, Vite
- **AI:** Google Gemini API
- **Icons:** Lucide React
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- A Google Gemini API Key.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd style-forge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` or `.env.local` file in the root directory.
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```
   *(Note: Verify the actual environment variable name used in the code, typically `VITE_` prefix is required for Vite)*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the local server address (usually `http://localhost:5173`).

## Usage

1. **Upload:** Click the upload area to select an image of a clothing item.
2. **Generate:** The AI will analyze the item and suggest outfits for different occasions.
3. **Explore:** Switch between the Casual, Business, and Night Out tabs to see the suggestions.
4. **Edit:** Use the chat/prompt interface to request changes to the current outfit.

## License

[MIT](LICENSE)
