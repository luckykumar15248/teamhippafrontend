// File: app/api/upload/route.ts
/*
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files received' }, { status: 400 });
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
        
        await writeFile(uploadPath, buffer);
        return `/uploads/${filename}`;
      })
    );

    return NextResponse.json({ paths: uploadResults }, { status: 200 });

  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Error uploading files' },
      { status: 500 }
    );
  }
}*/

// File: app/api/upload/route.ts

import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files received' }, { status: 400 });
    }

    // Create an array of promises for all file uploads
    const uploadPromises = files.map(file => {
      // Use the original filename for the blob store, replacing spaces
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      
      // The 'put' function uploads the file to Vercel Blob
      return put(filename, file, {
        access: 'public', // Make the file publicly accessible
      });
    });

    // Wait for all uploads to complete
    const blobs = await Promise.all(uploadPromises);
    
    // Extract the public URLs from the results
    const paths = blobs.map(blob => blob.url);

    // Return the array of public URLs, which your frontend expects
    return NextResponse.json({ paths: paths }, { status: 200 });

  } catch (error) {
    console.error('Error uploading files to Vercel Blob:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Error uploading files', details: errorMessage },
      { status: 500 }
    );
  }
}
