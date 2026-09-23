export default function HeroIllustration() {
  return (
    <div className="w-full max-w-md border border-gray-300 bg-white shadow-sm p-4 font-mono text-xs text-gray-800">
      {/* Window header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-gray-400 bg-gray-200 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full border border-gray-400 bg-gray-200 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full border border-gray-400 bg-gray-200 inline-block"></span>
        </div>
        <span className="text-[11px] text-gray-500 font-sans font-medium">terminal / dev-session</span>
        <span className="text-[10px] text-gray-400">bash</span>
      </div>

      {/* Terminal Content */}
      <div className="space-y-2 text-[11px] leading-relaxed">
        <div className="text-gray-500">$ git clone project-repo.git</div>
        <div className="text-gray-700 font-sans">Cloning into 'broken-hackathon-app'... done.</div>
        
        <div className="text-gray-500 pt-1">$ npm test</div>
        <div className="p-2 border border-gray-200 bg-gray-50 text-gray-800">
          <span className="text-red-700 font-semibold">[FAIL]</span> src/form.js:38<br />
          TypeError: Cannot read properties of undefined
        </div>

        <div className="text-gray-500 pt-1">$ vim src/form.js &amp;&amp; git commit -m "fix form event handler"</div>
        <div className="p-2 border border-gray-200 bg-gray-50 text-gray-800">
          <span className="text-green-700 font-semibold">[PASS]</span> 14 tests completed successfully.<br />
          Ready to package: <span className="font-semibold underline">solution-fix.zip</span>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-gray-200 text-gray-600 font-sans text-xs">
          <span>Status: Verified Fix</span>
          <span className="font-semibold text-gray-900">+1 Point Awarded</span>
        </div>
      </div>
    </div>
  );
}
