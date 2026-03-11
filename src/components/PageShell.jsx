import { motion } from "framer-motion";

export default function PageShell({ title, subtitle, icon: Icon, right, children }) {
  return (
    <motion.div
      className="w-full px-4 sm:px-6 lg:px-8 py-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {(title || subtitle || Icon || right) && (
        <div className="max-w-6xl mx-auto mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {Icon ? (
                <div className="w-10 h-10 rounded-xl bg-brand-800/60 border border-brand-700 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
              ) : null}
              {title ? <h1 className="text-2xl font-bold text-white truncate">{title}</h1> : null}
            </div>
            {subtitle ? <p className="text-gray-400 mt-2 max-w-2xl">{subtitle}</p> : null}
          </div>
          {right ? <div className="flex-shrink-0">{right}</div> : null}
        </div>
      )}
      <div className="max-w-6xl mx-auto">{children}</div>
    </motion.div>
  );
}

