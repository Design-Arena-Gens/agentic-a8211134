import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;

    if (!image) {
      return NextResponse.json(
        { error: 'تصویر الزامی است' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`;

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Use Stable Video Diffusion model
    const output = await replicate.run(
      "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
      {
        input: {
          input_image: base64Image,
          sizing_strategy: "maintain_aspect_ratio",
          frames_per_second: 6,
          motion_bucket_id: prompt ? 127 : 100,
          cond_aug: 0.02,
        }
      }
    );

    // The output is a video URL
    const videoUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ videoUrl });
  } catch (error: any) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در ساخت ویدیو' },
      { status: 500 }
    );
  }
}
