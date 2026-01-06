import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Gemini - user will need to set GOOGLE_API_KEY env variable
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

interface ExtractedItem {
    name: string
    quantity: number
    price: number
}

interface ExtractedBill {
    restaurantName?: string
    items: ExtractedItem[]
    subtotal: number
    tax: number
    serviceCharge: number
    discount: number
    total: number
    taxBreakdown?: {
        cgst?: number
        sgst?: number
        vat?: number
        serviceTax?: number
        gst?: number
    }
}

const EXTRACTION_PROMPT = `You are an expert at reading Indian restaurant receipts/bills. Analyze this receipt image and extract the following information in JSON format:

{
  "restaurantName": "name of the restaurant",
  "items": [
    {"name": "item name", "quantity": 1, "price": 100.00}
  ],
  "subtotal": 0,
  "tax": 0,
  "serviceCharge": 0,
  "discount": 0,
  "total": 0,
  "taxBreakdown": {
    "cgst": 0,
    "sgst": 0,
    "vat": 0,
    "serviceTax": 0,
    "gst": 0
  }
}

Important rules:
1. All prices should be in INR (Indian Rupees) as numbers without currency symbols
2. Extract EVERY food/drink item from the bill
3. For items with quantity > 1, use the UNIT price (divide total by quantity if needed)
4. Combine CGST + SGST + VAT + Service Tax into the "tax" field for the total tax
5. If there's a discount, put it in the "discount" field as a positive number
6. Service charge is often 5-10% and labeled as "Service Charge" or "SC"
7. Make sure subtotal + tax + serviceCharge - discount = total (approximately)
8. Be careful with Indian number formats (commas for thousands)
9. Look for items like: buffet, pizza, noodles, drinks, starters, main course, desserts
10. Ignore free items (price 0) or complimentary items

Return ONLY valid JSON, no explanations.`

export async function POST(request: NextRequest) {
    try {
        const { image } = await request.json()

        if (!image) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            )
        }

        // Check for API key
        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json(
                { error: 'Google API key not configured. Set GOOGLE_API_KEY environment variable.' },
                { status: 500 }
            )
        }

        // Extract base64 data from data URL
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

        // Use Gemini 2.5 Flash for image analysis
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const result = await model.generateContent([
            EXTRACTION_PROMPT,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data,
                },
            },
        ])

        const response = await result.response
        const text = response.text()

        // Parse JSON from response (handle markdown code blocks)
        let jsonStr = text
        if (text.includes('```json')) {
            jsonStr = text.split('```json')[1].split('```')[0].trim()
        } else if (text.includes('```')) {
            jsonStr = text.split('```')[1].split('```')[0].trim()
        }

        const extractedData: ExtractedBill = JSON.parse(jsonStr)

        // Validate and clean data
        const cleanedData: ExtractedBill = {
            restaurantName: extractedData.restaurantName || 'Unknown Restaurant',
            items: (extractedData.items || []).filter(
                (item) => item.name && item.price > 0
            ).map((item) => ({
                name: item.name.trim(),
                quantity: Math.max(1, Math.round(item.quantity || 1)),
                price: Math.round(item.price * 100) / 100,
            })),
            subtotal: Math.round((extractedData.subtotal || 0) * 100) / 100,
            tax: Math.round((extractedData.tax || 0) * 100) / 100,
            serviceCharge: Math.round((extractedData.serviceCharge || 0) * 100) / 100,
            discount: Math.round((extractedData.discount || 0) * 100) / 100,
            total: Math.round((extractedData.total || 0) * 100) / 100,
            taxBreakdown: extractedData.taxBreakdown,
        }

        // If subtotal is 0, calculate from items
        if (cleanedData.subtotal === 0 && cleanedData.items.length > 0) {
            cleanedData.subtotal = cleanedData.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            )
        }

        return NextResponse.json(cleanedData)
    } catch (error) {
        console.error('OCR Error:', error)
        return NextResponse.json(
            { error: 'Failed to process receipt. Please try again or enter items manually.' },
            { status: 500 }
        )
    }
}
